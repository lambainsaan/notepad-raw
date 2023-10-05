---
title: Coding recommendations
created: 2023-10-06T00:06:10+05:30
updated: 2023-10-06T00:06:10+05:30
---
# Use getters over computed where possible

In the context of Vue.js, which is a popular JavaScript framework for building user interfaces, there are two ways to create reactive properties or values: using getters and using computed properties. Let me explain both concepts and provide examples for better understanding.
**Getters**:
- Getters are functions that return a value based on some other reactive data. They are defined using the `ref` function.
- Getters are useful when you want to calculate or manipulate a value based on other reactive properties, and you want to access the value like a normal property.

Here's an example of using a getter:
```js
import { ref } from 'vue';

// Define a reactive property
const count = ref(0);

// Define a getter function
const doubleCount = () => count.value * 2;

// Usage
console.log(doubleCount()); // Access the value using the getter
```


In this example, `doubleCount` is a getter that calculates the double of the `count` reactive property. You can access its value by calling it like a function.

**Computed Properties**:
- Computed properties are values that are automatically updated whenever the reactive dependencies they rely on change. They are defined using the `computed` function.
- Computed properties are useful when you want to create a new reactive value based on other reactive properties, and you want it to automatically update when those dependencies change.

Here's an example of using a computed property:

```js
import { ref, computed } from 'vue';

// Define a reactive property
const count = ref(0);

// Define a computed property
const doubleCount = computed(() => count.value * 2);

// Usage
console.log(doubleCount.value); // Access the value like a property
```

In this example, `doubleCount` is a computed property that calculates the double of the `count` reactive property. You can access its value using the `.value` property.

The recommendation to use getters (`() => value`) over computed (`computed(() => value)`) typically comes from a performance perspective. Getters are often more efficient when you only need to calculate a value once based on other reactive properties, while computed properties are better suited for values that need to automatically update whenever their dependencies change.

So, if you have a simple calculation or transformation to perform on reactive data, it's recommended to use a getter. If you need a value that automatically updates based on reactive dependencies, then you should use a computed property.

