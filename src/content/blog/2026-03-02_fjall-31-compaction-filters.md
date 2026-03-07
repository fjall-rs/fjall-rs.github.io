---
title: "Fjall 3.1: Compaction filters"
slug: fjall-3-1
description: Run custom logic during compactions
tags:
  - minor
  - release
  - compaction
  - short
published_at: 2026-03-06T20:49:08.650Z
last_modified_at: 2026-03-06T20:49:08.650Z
image: /media/thumbs/kawaii.png
---

Fjall is an embeddable LSM-based forbid-unsafe Rust key-value storage engine.
Its goal is to be a reliable & predictable but performant general-purpose KV storage engine.

---

LSM-trees run background compactions to recoup read performance degradation (by reordering files) and get rid of stale data.
While normally compactions are a "necessary evil" to make LSM-trees work, because they run in the background and naturally scan through a subset of the database, they are a great fit to run batch jobs.
This has been possible in e.g. RocksDB for a long time, and finally, Fjall has the possibility to run custom logic during compactions, called `Compaction Filters`.
Most of the compaction filter implementation was contributed by [@iczero](https://github.com/iczero).

The idea and API is simple: the user registers a callback function for every key-value pair that is scanned during compactions.
The function decides whether to remove the key-value pair, change it, or keep it as is (default).

Here is a rough example of a filter that drops all key-value pairs with a specific JSON property:

```rs
use fjall::compaction::filter::{CompactionFilter, Verdict, Context};

struct AFilter;

impl CompactionFilter for AFilter {
    fn filter_item(
        &mut self,
        item: ItemAccessor<'_>,
        _ctx: &Context,
    ) -> lsm_tree::Result<Verdict> {
        let json = /* parse json */;

        if json["is_deleted"].is_some() {
          Verdict::Remove
        }
        else {
          Verdict::Keep
        }
    }
}
```

It's important to keep in mind that the time at which point compactions run is not deterministic; compactions may never run if the database is not being written to (unless manually scheduled)!
For that reason, they can only take care of logic that is allowed to run lazily, e.g. TTL rules or garbage collection.
For the TTL case, the application layer could, if necessary, filter non-compacted, but expired KVs.
At some point then, some compaction will probably run and get rid of expired KVs.
Ultimately, this gives users the ability to replace certain scan-and-modify patterns which can be very costly.

## Registering compaction filter factories

To register compaction filters, a mapping function at the database-level is used:

```rs
let db = fjall::Database::builder(&folder)
    .with_compaction_filter_factories(Arc::new(|keyspace| match keyspace {
        "my_keyspace_1" => Some(Arc::new(MyTtlFilterFactory)),
        "my_keyspace_2" => Some(Arc::new(SomeOtherFilterFactory)),
        _ => None,
    }))
    .open()?;
```

This mapping function registers filter factories (a factory is another user-implemented trait that sets up the filters shown above) to specific keyspaces.
This is necessary (instead of being a per-keyspace configuration) because Fjall databases recover their keyspaces before the user has access to them.

## Defining filter factories

Factories create an instance of a filter every time a compaction is scheduled.
This allows keeping some global state (e.g. a TTL watermark) and pass it into the filters:

```rs
struct MyFactory(Arc<AtomicU64>);

impl Factory for MyFactory {
    fn make_filter(&self, _ctx: &Context) -> Box<dyn CompactionFilter> {
        Box::new(MyFilter(self.0.load(std::sync::atomic::Ordering::Relaxed)))
    }

    fn name(&self) -> &str {
        "ttl"
    }
}
```
