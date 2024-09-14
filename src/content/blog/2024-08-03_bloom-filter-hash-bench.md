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
last_modified_at: 2024-08-05T20:42:53.520Z
image: /media/thumbs/bloom.jpg
---

`lsm-tree 1` uses `seahash` for creating hashes in its bloom filters.
`seahash` is decently fast; but as I crunched the numbers, I noticed the overhead of CPU time spent hashing keys can be non-trivial in hot path scenarios (all blocks are cached).

[Previously, we explored how hash sharing](/post/bloom-filter-hash-sharing) decreases the hashing phase from O(n) to O(1) (n being the number of disk segments), so while every point read's hashing phase is just very short, even just a couple of nanoseconds can add up, increasing point read performance by a couple of hundred thousands reads per second: any point read has a base cost of somewhere around 200ns.
Even squeezing out 10-20ns can increase hot read performance by about 5-10%.

## Results

The benchmark code sets up a single disk segment and reads an existing key from it 25 million times.

All benchmarks ran on an i9 11900k.

<div style="margin-top: 10px; width: 100%; display: flex; justify-content: center">
  <img style="border-radius: 16px; max-height: 500px" src="/media/posts/bloom-filter-hash-bench/hash_function_performance.svg" />
</div>

### ns per read

| Key Size | xxhash::h3 | seahash | cityhash | metrohash | rustc_hash | fasthash::spooky | fxhash |
| -------- | ---------- | ------- | -------- | --------- | ---------- | ---------------- | ------ |
| 1B       | 182ns      | 225ns   | 200ns    | 186ns     | 191ns      | 218ns            | 192ns  |
| 8B       | 193ns      | 208ns   | 197ns    | 186ns     | 190ns      | 216ns            | 198ns  |
| 36B      | 196ns      | 215ns   | 200ns    | 190ns     | 196ns      | 226ns            | 206ns  |
| 73B      | 202ns      | 227ns   | 218ns    | 194ns     | 197ns      | 242ns            | 206ns  |
| 147B     | 210ns      | 240ns   | 232ns    | 202ns     | 207ns      | 256ns            | 227ns  |
| 1000B    | 253ns      | 388ns   | 324ns    | 257ns     | 288ns      | 318ns            | 457ns  |

### RPS

| Key Size | xxhash::h3 | seahash | cityhash | metrohash | rustc_hash | fasthash::spooky | fxhash  |
| -------- | ---------- | ------- | -------- | --------- | ---------- | ---------------- | ------- |
| 1B       | 5494505    | 4444444 | 5000000  | 5376344   | 5235602    | 4587155          | 5208333 |
| 8B       | 5376344    | 4807692 | 5076142  | 5376344   | 5263157    | 4629629          | 5050505 |
| 36B      | 5102040    | 4651162 | 5000000  | 5263157   | 5102040    | 4424778          | 4854368 |
| 73B      | 4950495    | 4405286 | 4587155  | 5154639   | 5076142    | 4201680          | 4854368 |
| 147B     | 4761904    | 4166666 | 4310344  | 4950495   | 4830917    | 3937007          | 4405286 |
| 1000B    | 3952569    | 2577319 | 3086419  | 3891050   | 3472222    | 3154574          | 2188183 |

I don't know which hashing function I will end up using in `lsm-tree 2` yet. Probably `xxhash`, but I have not benchmarked if the hashing functions have any meaningful impact on false positive rates yet.
The future will decide...
