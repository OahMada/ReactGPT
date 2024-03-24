## Live Demo

<https://gilded-bonbon-74b9b9.netlify.app/>

## Main Feature

This app helps you compose English essays better by leveraging the OpenAI API.

Main functionality:

- Find and apply available grammar fixes in the article
- Undo any adjustments made to the article
- Translate the article
- Search for existing articles
- Pin/Bookmark articles
- Preview the result and export it as a PDF, DOCX, or PNG file
- Customize the OpenAI API key
- Global hotkey support, view available hotkeys in hotkey map page
- Responsive layout on mobile devices
- Pre-commit hook with Husky & lint-staged
- Serverless function implementation and deployment on Netlify
- Integration test with React Testing Library
- V8 test coverage report
- Offload file exports to web worker

Main libraries used:

- Redux Toolkit for local state management
- Tanstack Query for API queries
- React Router for client-side routing
- React Hook Form
- React Hotkeys Hook for hotkey navigation
- Styled Components for styling
- Mock Service Worker for API mocking
- React Beautiful DND for drag and drop interaction
- etc.

## Inspiration

- [vite-template-redux](https://github.com/reduxjs/redux-templates/tree/master/packages/vite-template-redux)
