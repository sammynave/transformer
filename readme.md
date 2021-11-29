times executing transform on `orders-big.json`

|script             | execution time (4 runs in ms)|
|-------------------|------------------------------|
|npm run ramda      | [218, 213, 223, 217]         |
|npm run immutable  | [476, 486, 472, 489]         |
|npm run transducers| [334, 320, 333, 318]         |
|npm run mori       | [577, 581, 714, 591]         |

