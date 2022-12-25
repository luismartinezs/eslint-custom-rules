module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce only certain elements within `<ul>` and `<ol>` elements',
      category: 'Possible Errors',
      recommended: true,
      url: 'https://example.com/docs/rules/only-certain-elements-within-ul-ol.html'
    },
    schema: [],
    messages: {
      onlyCertainElements: 'Only `<li>`, `<script>`, and `<template>` elements are allowed within `<ul>` and `<ol>` elements.'
    }
  },
  create: function (context) {
    return {
      JSXElement(node) {
        if (node.openingElement.name.name !== 'ul' && node.openingElement.name.name !== 'ol') {
          return
        }
        for (const child of node.children) {
          if (child.type === 'JSXElement') {
            if (child.openingElement.name.name !== 'li' && child.openingElement.name.name !== 'script' && child.openingElement.name.name !== 'template') {
              context.report({
                node: child,
                messageId: 'onlyCertainElements'
              })
            }
          }
        }
      }
    }
  }
}
