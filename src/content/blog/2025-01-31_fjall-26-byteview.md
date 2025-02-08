---
title: "When Rust's Arc is not enough: Announcing Fjall 2.6"
slug: fjall-2-6-byteview
description: Introducing byteview for better performance in Fjall
tags:
  - release
  - performance
  - benchmark
  - memory usage
  - byteview
published_at: 2025-02-08T17:27:32.687Z
last_modified_at: 2025-02-08T17:27:32.687Z
image: /media/thumbs/arch-bridge.jpg
---

As teased in the [2.0 announcement](/post/announcing-fjall-2), the newly introduced `Slice` type allowed changing the underlying implementation without breaking changes.
Until now, an `Arc<[u8]>` was used.

The 2.6 release now introduces a new underlying byte slice type to optimize memory usage and deserialization speed.

## Arc basics

`Arc<T>` (**A**tomically **R**eference **C**ounted) is a smart pointer in the Rust standard library that can be shared between threads.
Its contents (the generic parameter `T`) are allocated on the heap, including some atomic counters (called the _strong_ and _weak_ count) that defines how often the value is currently referenced.
Whenever an `Arc` is cloned, the _strong count_ is incremented by 1, using atomic CPU instructions.
When an `Arc` is dropped, the _strong count_ is decremented by 1.
Because an atomic fetch-and-subtract operation returns the previous value, one - and only one - dropped `Arc` will be the "last owner", making sure it will free the heap-allocated memory.

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/arc.svg" />
</div>

Arcs are a simple way to share some data across your application, no matter how many threads there are.
However, there are a couple of caveats:

- the Arc's contents (the `T`) are read-only, unless you can guarantee you are the sole owner (using [`Arc::get_mut`](https://doc.rust-lang.org/std/sync/struct.Arc.html#method.get_mut) or synchronization such as a Mutex)
- each _newly constructed_ Arc has additional memory overhead because of its additional reference counts (_strong_ and _weak_)
- sharing Arcs (by "cloning") is more expensive than a reference because of the atomic CPU instruction(s) used

## Arc'd slices

Things get a bit more complicated when you want to store a slice of values (`[T]`) inside an Arc.
Now, we also have to keep track of the slice's length.
This is done using a "fat" pointer.

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/arc_slice.svg" />
</div>

When constructing an Arc'd slice, there is no proper API for that, one easy way is to use an intermediary Vec:

```rs
let v = vec![0; len]; // heap allocation
let a: Arc<[u8]> = v.into(); // heap allocation
```

Unfortunately, this requires 2 heap allocations.

When storing a slice, an Arc has a stack size of 16 bytes (fat pointer), plus 16 bytes for the strong and weak counts, giving us a memory overhead of 32 bytes per value.

## Usage of `Arc<[u8]>` inside `lsm-tree`

`lsm-tree`, by default, represents keys and values using an `Arc<[u8]>`, in a newtype called `Slice`.
One interesting property is that LSM-trees are an append-only data structure - so we never need to update a value, meaning all `Slices` are immutable.

```rs
struct Slice(Arc<[u8]>);
// ----------^
// the Slice is opaque, the user does not know it uses an Arc internally
```

`lsm-tree` already supports `bytes` as an underlying `Slice` implementation since version [2.4.0](/post/fjall-2-5#tokio-bytes-support).
However, while flexible, `bytes` is not a silver bullet, and using it as the default would include another required dependency.
So for the default implementation, replacing `Arc` could be beneficial as it has some downsides:

### Downside: Deserialization into `Arc<[T]>`

When deserializing a data block from an I/O reader, each key and value is constructed, using something like this:

```rs
let len = read_len(file_reader)?; // values are prefixed by length
let v = vec![0; len]; // heap allocation
v.read_exact(file_reader)?;
let v = Slice::from(v); // construct Arc<[u8]> from vector; heap allocation again
```

In this scenario, we want fast deserialization speed, so skipping the second heap allocation would be beneficial.

### Downside: Weak count

Next to the _strong count_ there is also a _weak count_.
However this _weak count_ is never used.
Because each key and value is an `Arc<[u8]>`, each cached key and value carries an (unused) _weak count_.
Omitting the _weak count_ would save 8 bytes per `Slice`.

### Downside: Empty slices allocate

When using `Arc<[T]>`, empty slices still need a heap allocation:

```rs
for _ in 0..1_000 {
  let a = std::sync::Arc::<[u8]>::from([]);
}
```

If you run this example, it will perform 1'000 heap allocations, even though the slice is empty.
While empty slices are not commonly used, they can still play a pivotal role in certain situations:

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/myrocks_key.png" />
</div>

As shown in MyRocks' key schema, every secondary index entry is just an encoded key, with no value ("_N/A_").
Here, not needing a heap allocation for the empty value would be very beneficial.

### Consideration: Large strings have no real life use

The `len` field takes 8 bytes, so it can represent every possible string.
However, large byte slices simply do not exist in real world KV scenarios (`lsm-tree` supports 32-bits of length, though I would not recommend anything above ~1 MB).
Reducing it to 4 bytes still allows slices of up to 4GB, saving another 4 bytes per slice.

## Introducing `byteview`

`byteview` is a new Rust crate that implements a thin, immutable, clonable byte slice.
It is based on [Umbra/CedarDB's "German-style"](https://cedardb.com/blog/german_strings/) strings (also found in projects like [Polars](https://pola.rs/posts/polars-string-type/), [Apache Arrow](https://arrow.apache.org/) and [Meta's Velox](https://engineering.fb.com/2023/03/09/open-source/velox-open-source-execution-engine/)).
However, `byteview` uses an additional pointer to support a slice-copy operation like [Tokio's `bytes` crate](https://crates.io/crates/bytes).

For small values there can be some big space savings:

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/byteview_mem.svg" />
</div>

## How `byteview` works

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/byteview.svg" />
</div>
<div class="text-sm mt-1" style="text-align: center; opacity: 0.75">
  <i>Memory layout of byteview</i>
</div>

The basic concept of `byteview` is pretty simple.
The struct size is fixed at 24 bytes.
The length is stored as 4 bytes at the very start.
If the string is 20 characters or shorter, it is directly inlined into the string, no pointer or heap allocation needed.

> In this case, the memory overhead is (20 - n + 4) bytes.

Indeed, `byteview` allows inlined strings up to 20 characters (instead of 12 as is typical with other implementations); the struct is larger because of its additional pointer.
Luckily, 16 byte strings tend to be pretty common, because that is the size of all common UUID-like string schemas, bringing quite significant space savings there (as seen above).

If the string is larger than 20 characters, it will be heap allocated and the pointer + length stored in the struct.
The remaining 4 bytes store the first four bytes (prefix) of the string, allowing short-circuiting some `eq` and `cmp` operations without pointer dereference.
The heap allocation contains a single strong count and the byte slice.

> In this case, the memory overhead is 32 bytes.

## Results

### Block deserialization speed benchmark

`byteview` natively supports deserialization from any [`io::Read`](https://doc.rust-lang.org/std/io/trait.Read.html) without intermediate buffer for construction:

```rs
let len = read_len(file_reader)?; // values are prefixed by length
let v = ByteView::from_reader(file_reader, len); // (possibly) heap allocation
```

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/ctor_long_bench.png" />
</div>

For inlinable values, there is no heap allocation:

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/ctor_short_bench.png" />
</div>

### Reading large blobs

In a key-value separated LSM-tree, the user value is not stored as-is, but prefixed by some additional metadata.
Because we cannot return that metadata to the user, previously `lsm-tree` had to clone out the user value into a new `Slice`.
For large blobs, this would cause one additional heap allocation per blob read, and an _O(n)_ memcpy for each value.

Because all inserts are initially added to the memtable as an inlined value, fresh inserts also needed to be cloned when read.

`byteview` supports slicing an existing heap allocation, so we can skip the heap allocation and copying, giving constant time performance for such blob values.

The following benchmark is a bit contrived, but illustrates the issue.
10 x 64 KiB blobs are written to the database and then read randomly (Zipfian).

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/blob_memtable_point_read_rate.png" />
</div>

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/blob_memtable_point_read_percentiles.png" />
</div>

---

Using a more realistic workload, here are 1 million 1K values that are read randomly (truly random) with no cache.
Because the data set is now ~1 GB, not all reads are terminated at the memtable, still reads are about 20% faster.

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/blob_point_read_rate.png" />
</div>

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/blob_point_read_percentiles.png" />
</div>

### Compaction performance

In `lsm-tree`, compactions need to read an entire disk segment block-by-block, so improving deserialization speeds inadvertently increases compaction throughput.

The following benchmark compacts 10 disk segments with 1 million key-value-pairs (around 24 - 150 bytes per value) each.

Before (2.6.0 without byteview):

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/compaction_before_bv.png" />
</div>

After (2.6.0 with byteview):

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/compaction_after_bv.png" />
</div>

> (Open the image in a new tab to zoom into the flame graph)

With `Arc<[u8]>` around 44% of the runtime is spent in `Slice::from_reader` because of the superfluous heap allocations, buffer zeroing and memory copies when constructing each `Slice`.

With `ByteView`, this stage is reduced to 26%.

### Uncached read performance

Read performance is generally better across the board, here's a benchmark reading randomly from 1 million 128-byte values, with no cache:

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/random_read_rate.png" />
</div>

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/random_read_percentiles.png" />
</div>

With a block size of 32 KiB (above is 4 KiB):

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/random_read_32k_rate.png" />
</div>

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/random_read_32k_percentiles.png" />
</div>

And here's the same without using jemalloc (but the default Ubuntu system allocator instead):

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/random_read_32k_sysalloc_rate.png" />
</div>

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/random_read_32k_sysalloc_percentiles.png" />
</div>

And, for good measure, here is mimalloc:

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/random_read_32k_mimalloc_rate.png" />
</div>

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/random_read_32k_mimalloc_percentiles.png" />
</div>

## Other compaction improvements

Until now, compactions used the same read path as a normal read request:

1. look into block cache
2. if found in cache, load block from cache
3. else, load block from disk

However, the possibility of the majority of blocks being cached is slim, so the overhead of looking into the block cache actually did not really help with compaction speeds.

Additionally, the compaction streams did not own their file descriptors, but instead borrowed them from a global file descriptor cache for each block read.
This would also increase overhead because yielding the file descriptor caused the next block read to need an `fseek` syscall.
Also the compaction stream could not use a higher buffer size (for reading ahead).

That does not mean, compactions cannot profit from I/O caching.
The reads still go through the operating system's page cache, so not every block read may end up performing I/O, though this is at the mercy of the operating system in use.

Now, every compaction stream uses its own file descriptor and does not access the block cache.
This makes the read-and-write compaction path much simpler, yielding some great performance boost:

Before (2.5.0):

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/compaction_before.png" />
</div>

After (2.6.0):

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/fjall-26-byteview/compaction_after.png" />
</div>

> (Open the image in a new tab to zoom into the flame graph)

## MSRV

The minimum supported `rustc` version has increased from **1.74** to **1.75**.

## Fjall 2.6

`lsm-tree` and `fjall` 2.6 are now available in all cargo registries near you.

Oh, and [`byteview` is MIT-licensed!](https://crates.io/crates/byteview)!
