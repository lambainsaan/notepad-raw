---
title: Nuxt - Paying attention to detail
created: 2023-10-05T23:06:47+05:30
updated: 2023-11-03T18:50:04+05:30
---
In this note, I will just jot down a few points that are easy to overlook while developing a Nuxt application.

My focus is on a server side rendered website, as I am [[Learning Nuxt 3|Learning Nuxt 3 for an SSR project]]. So I might overlook some of the things in the sections around Client Side Rendering.

### Dynamic imports of CSS in JS are not server side compatible

Discouraged ❌
```html
<script>
// Use a static import for server-side compatibility
import '~/assets/css/first.css'

// Caution: Dynamic imports are not server-side compatible
import('~/assets/css/first.css')
</script>
```

Recommended ✅
```html
<style>
@import url("~/assets/css/second.css");
</style>
```


