---
title: Which hash function makes the fastest bloom filter?
slug: bloom-filter-hash-bench
description: Benchmarking Rust-based hash functions in LSM-trees
tags:
  - bloom filter
  - lsm tree
  - point reads
  - performance
  - hashing
  - short
  - benchmark
published_at: 2024-08-03T20:42:53.520Z
last_modified_at: 2024-08-03T20:42:53.520Z
image: /media/posts/bloom.jpg
---

`lsm-tree 1` uses `seahash` for creating hashes in its bloom filters.
`seahash` is decently fast; but as I crunched the numbers, I noticed the overhead of CPU time spent hashing keys can be non-trivial in hot path scenarios (all blocks are cached).

[Previously, we explored how hash sharing](/post/bloom-filter-hash-sharing) decreases the hashing phase from O(n) to O(1) (n being the number of disk segments), so while every point read's hashing phase is just very short, even just a couple of nanoseconds can add up, increasing point read performance by a couple of hundred thousands reads per second: any point read has a base cost of somewhere around 200ns.
Even squeezing out 10-20ns can increase hot read performance by about 5-10%.

## Results

The benchmark code sets up a single disk segment and reads an existing key from it 20 million times.

All benchmarks ran on an i9 11900k.

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/hash_function_performance.svg" />
</div>

Results (zoomed in) ignoring 1000 byte keys, as they are unlikely and not recommended for any kind of workload.

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/hash_function_performance_2.svg" />
</div>

| key size | xxhash::xxh3 | seahash   | cityhasher | metrohash | fxhash    | fasthash::spooky |
| -------- | ------------ | --------- | ---------- | --------- | --------- | ---------------- |
| 1        | 4,424,778    | 4,065,040 | 4,424,778  | 4,219,409 | 4,545,454 | 4,587,155        |
| 8        | 4,424,778    | 4,329,004 | 4,329,004  | 4,273,504 | 4,545,454 | 4,524,886        |
| 36       | 4,385,964    | 4,184,100 | 4,237,288  | 4,048,582 | 4,504,504 | 4,484,304        |
| 73       | 4,255,319    | 3,952,569 | 3,937,007  | 3,846,153 | 4,385,964 | 4,291,845        |
| 147      | 4,098,360    | 3,717,472 | 3,773,584  | 3,759,398 | 4,000,000 | 4,048,582        |
| 1000     | 3,225,806    | 2,272,727 | 2,724,795  | 2,631,578 | 2,032,520 | 3,205,128        |

I think it's fair to say `xxhash xxh3` and `spookyhash` dominate pretty much across the board.

`fxhash` has a bit of a lead for keys up to 72 bytes (2x UUIDv4), but its performance decay is more steep than any other hash function in this benchmark.
But it may be the best hashing function in this benchmark for typical key lengths (< 128 bytes).

I don't know which hashing function I will end up using in `lsm-tree 2` yet. Probably `xxhash`, but I have not benchmarked if the hashing functions have any meaningful impact on false positive rates yet.
The future will decide...
