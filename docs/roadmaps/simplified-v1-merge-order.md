# Simplified V1 Merge Order

```text
Wave 0
├── D1
└── B1
    ├── B2
    ├── B3
    │   ├── B5
    │   └── B6
    └── B4

D1 → D2 → D3
D1+B1 → F1
D2+B2 contract+F1 → F2
D2+B5 contract+F1 → F3
B3+F3 → F4/F5
B4+F1/F3 → F6
B6+F3 → F7
B2–B6 → B7
all → I1
```

Recommended merge sequence:

1. Wave 0.
2. B1.
3. D1.
4. B2/B3/B4 in reviewed order; refresh other branches after each.
5. D2.
6. F1.
7. B5/B6.
8. D3.
9. F2.
10. B7.
11. F3.
12. F6.
13. F4/F5/F7.
14. I1.

B7 is late because it consumes package APIs and owns the largest hotspot. Frontend starts earlier using stable contracts and deterministic fixtures.

Every PR must be focused, tested, linked with `Closes #...`, externally reviewed, and not self-merged.
