---
created: 2023-10-06T08:36:43+05:30
updated: 2023-11-09T23:13:48+05:30
---
# Lazy API calls
> [Data fetching · Lazy](https://nuxt.com/docs/getting-started/data-fetching#lazy)

By default, data fetching composables will wait for the resolution of their asynchronous function before navigating to a new page by using Vue’s Suspense. This feature can be ignored on client-side navigation with the `lazy` option. In that case, you will have to manually handle loading state using the `pending` value.

app.vue

```html
<script setup lang="ts">
const { pending, data: posts } = useFetch('/api/posts', {
  lazy: true
})
</script>

<template>
  <!-- you will need to handle a loading state -->
  <div v-if="pending">
    Loading ...
  </div>
  <div v-else>
    <div v-for="post in posts">
      <!-- do something -->
    </div>
  </div>
</template>
```

You can alternatively use [`useLazyFetch`](https://nuxt.com/docs/api/composables/use-lazy-fetch) and `useLazyAsyncData` as convenient methods to perform the same.

```js
const { pending, data: posts } = useLazyFetch('/api/posts')
```


