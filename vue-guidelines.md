# Vue.js Guidelines

## Component Naming Conventions

### Multi-word Component Names
- **Rule**: Always use multi-word names for Vue components
- **Example**: Use `LetterGame` instead of `Game1`
- **ESLint Rule**: `vue/multi-word-component-names`
- **Reason**: This prevents conflicts with existing and future HTML elements, since all HTML elements are single words.

### Error Example
```
[eslint] 
C:\Users\Skynet\PhpstormProjects\Amaury\src\views\Game1.vue
  39:9  error  Component name "Game1" should always be multi-word  vue/multi-word-component-names
```

### How to Fix
Change the component name in the script section:
```javascript
export default {
  name: 'LetterGame', // Good: multi-word name
  // Instead of: name: 'Game1', // Bad: single-word name
  // ...
}
```

## Other Best Practices
(To be added as needed)