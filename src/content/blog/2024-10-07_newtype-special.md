---
title: Conditional type specialization using newtypes
slug: conditional-newtypes
description: Using Rust newtypes to specialize conditional types
tags:
  - short
  - design pattern
published_at: 2024-10-07T14:27:50.729Z
last_modified_at: 2024-10-07T14:27:50.729Z
---

In an LSM-tree, the levels contain the disk segments (a.k.a. SSTable) of the tree. Each disk segment holds a sorted list of key-value pairs; depending on the segments' key ranges, the level may or may not be _disjoint_.
During the making of [release 2.1](/post/fjall-2-1), there was a need for a specialized function inside an LSM-tree's level if it was disjoint.

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 400px" src="/media/posts/newtype-special/disjoint_non_disjoint.svg" />
</div>

If it is disjoint, certain operations can be optimized, because the level will be sorted by key range, allowing binary search inside the level (see more in the [2.1 release post](/post/fjall-2-1)):

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 400px" src="/media/posts/fjall-21/range_culling_compare.svg" />
</div>

The binary search function itself looked like this:

```rs
/// Returns the segment that possibly contains the key.
///
/// This only works for disjoint levels.
///
/// # Panics
///
/// Panics if the level is not disjoint.
pub fn disjoint_get_segment_containing_key<K: AsRef<[u8]>>(
    &self,
    key: K,
) -> Option<Arc<Segment>> {
    assert!(self.is_disjoint, "level is not disjoint");

    let idx = self
        .segments
        .partition_point(|x| &*x.metadata.key_range.1 < key.as_ref());

    self.segments.get(idx).cloned()
}
```

It works, but the assertion makes it a bit awkward.
Basically the caller needs to make sure it is allowed to call this function, like this:

```rs
if level.is_disjoint {
  // We are allowed to use functions optimized for disjoint levels
  let _ = level.disjoint_get_segment_containing_key(&key);
}
```

However, this is error prone, increases code complexity and goes against idiomatic Rust: Making illegal states unrepresentable.

## Newtypes to the rescue

Newtypes are basically wrapper types that allow some specialization of its inner type - and they have zero runtime cost.

Consider this example that models a password type (source: [Rust Design Patterns](https://rust-unofficial.github.io/patterns/patterns/behavioural/newtype.html)):

```rs
struct Password(String);

impl std::fmt::Display for Password {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "****************")
    }
}

fn main() {
    let unsecured_password = "ThisIsMyPassword".to_string();
    println!("unsecured_password: {unsecured_password}");

    let secured_password = Password(unsecured_password);
    println!("secured_password: {secured_password}");
}
```

prints

```
unsecured_password: ThisIsMyPassword
secured_password: ****************
```

Another example would be using a newtype for special integers:
In an LSM-tree, every block is at an offset in a file, and the block index points to every block. Simplified:

```rs
struct BlockIndex(HashMap<Key, u64>);

// ... impl omitted
```

By giving the block index a key, we get the offset to load from file.
Great, but now consider this:

```rs
let a = 7;

let key = "a";
let offset = block_index.get(key)?;

let block = load_block(a)?; // OK??
```

Granted, this is a far-fetched example, but in a large codebase, as values travel through many layers of functions and data structures, primitive values such as "u64" can lose semantic meaning.
You can use a type alias (`type BlockOffset = u64;`), but that does not give compile-time guarantees, compared to newtypes:

```rs
struct BlockOffset(u64);

struct BlockIndex(HashMap<Key, BlockOffset>);

// ... impl omitted

let block = load_block(a)?; // error: does not compile

let block = load_block(offset)?; // OK
```

Again, used in this way, newtypes do not have any runtime cost, it is simply a compile-time "marker" to enhance semantics in our codebase.

## Going back

Looking back at the disjoint levels, I decided to introduce a `DisjointLevel` newtype that contains all disjoint specializations:

```rs
pub struct DisjointLevel<'a>(&'a Level);

impl<'a> DisjointLevel<'a> {
    /// Returns the segment that possibly contains the key.
    pub fn get_segment_containing_key<K: AsRef<[u8]>>(&self, key: K) -> Option<Arc<Segment>> {
        let level = &self.0;

        let idx = level
            .segments
            .partition_point(|x| &*x.metadata.key_range.1 < key.as_ref());

        level.segments.get(idx).cloned()
    }
}
```

And a `Level` can be probed for being disjoint using:

```rs
pub fn as_disjoint(&self) -> Option<DisjointLevel<'_>> {
    if self.is_disjoint {
        Some(DisjointLevel(self))
    } else {
        None
    }
}
```

If `as_disjoint` returns `None`, it is not disjoint; then it is impossible for us to access the disjoint specializations that would crash our program (or return a wrong result).

So instead of:

```rs
if level.is_disjoint() {
  let item = level.disjoint_get_segment_containing_key(&key)?;
}
else {
  // fallback
}
```

we do:

```rs
if let Some(level) = level.as_disjoint() {
  let item = level.get_segment_containing_key(&key)?;
}
else {
  // fallback
}
```

Less assertions, less stuff that can go wrong, and we can match on the disjointness of a level.

## Summary

Newtypes are a great way to have more compile-time guard rails in your codebase and attach additional functionality to primitive types at no additional runtime costs, all while enhancing semantics like type definitions.
