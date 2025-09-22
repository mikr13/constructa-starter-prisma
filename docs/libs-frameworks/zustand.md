================
CODE SNIPPETS
================
TITLE: Full Example Imports and Setup (TypeScript/React)
DESCRIPTION: Provides the necessary imports from React and Zustand, along with the type definitions and initial store setup functions. This serves as a complete starting point for the scoped store example.

SOURCE: https://zustand.docs.pmnd.rs/hooks/use-store-with-equality-fn

LANGUAGE: typescript
CODE:
```
import {
  type ReactNode,
  useState,
  useCallback,
  useContext,
  createContext,
} from 'react'
import { createStore, useStore } from 'zustand'

type CounterState = {
  count: number
}

type CounterActions = { increment: () => void }

type CounterStore = CounterState & CounterActions

const createCounterStore = () => {
  return createStore<CounterStore>()((set) => ({
    count: 0,
    increment: () => {
      set((state) => ({ count: state.count + 1 }))
    },
  }))
}

const createCounterStoreFactory = (
  counterStores: Map<string, ReturnType<typeof createCounterStore>>,
) => {
  return (counterStoreKey: string) => {
    if (!counterStores.has(counterStoreKey)) {
      counterStores.set(counterStoreKey, createCounterStore())
    }
    return counterStores.get(counterStoreKey)!
  }
}

const CounterStoresContext = createContext<Map<
  string,
  ReturnType<typeof createCounterStore>
> | null>(null)

const CounterStoresProvider = ({ children }: { children: ReactNode }) => {

```

--------------------------------

TITLE: Zustand State Update Example
DESCRIPTION: Shows a Zustand store setup for managing a 'count' state and an action to update it using a callback function.

SOURCE: https://zustand.docs.pmnd.rs/getting-started/comparison

LANGUAGE: javascript
CODE:
```
import { create } from 'zustand'

type State = {
  count: number
}

type Actions = {
  setCount: (countCallback: (count: State['count']) => State['count']) => void
}

const useCountStore = create<State & Actions>((set) => ({
  count: 0,
  setCount: (countCallback) =>
    set((state) => ({ count: countCallback(state.count) })),
}))
```

--------------------------------

TITLE: Install Zustand using npm
DESCRIPTION: This snippet shows how to install the Zustand package using npm. It's a standard installation command for Node.js package management.

SOURCE: https://zustand.docs.pmnd.rs/getting-started/introduction

LANGUAGE: bash
CODE:
```
npm install zustand
```

--------------------------------

TITLE: Install Zustand using NPM
DESCRIPTION: This snippet shows the command to install Zustand using NPM. It's a basic package installation command.

SOURCE: https://zustand.docs.pmnd.rs/index

LANGUAGE: bash
CODE:
```
# NPM
npm install zustand
# Or, use any package manager of your choice.
```

--------------------------------

TITLE: Complete React App Example with Zustand
DESCRIPTION: Provides a full React application example that integrates a Zustand vanilla store with the `useStoreWithEqualityFn` hook to create a draggable dot. Includes store setup, component logic, and app rendering.

SOURCE: https://zustand.docs.pmnd.rs/hooks/use-store-with-equality-fn

LANGUAGE: typescript
CODE:
```
import { createStore } from 'zustand'
import { useStoreWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow'

// Store definition
type PositionStoreState = { position: { x: number; y: number } }
type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}
type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set({ position }),
}))

// MovingDot component
function MovingDot() {
  const position = useStoreWithEqualityFn(
    positionStore,
    (state) => state.position,
    shallow,
  )
  const setPosition = useStoreWithEqualityFn(
    positionStore,
    (state) => state.setPosition,
    shallow,
  )

  return (
    <div
      onPointerMove={(e) => {
        setPosition({
          x: e.clientX,
          y: e.clientY,
        })
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}
      />
    </div>
  )
}

// App component
export default function App() {
  return <MovingDot />
}
```

--------------------------------

TITLE: HTML for Zustand Combine Example
DESCRIPTION: Provides the necessary HTML structure for the Zustand `combine` middleware example, including a container and a dot element that will be positioned by the store.

SOURCE: https://zustand.docs.pmnd.rs/middlewares/combine

LANGUAGE: html
CODE:
```
<div
  id="dot-container"
  style="position: relative; width: 100vw; height: 100vh;"
>
  <div
    id="dot"
    style="position: absolute; background-color: red; border-radius: 50%; left: -10px; top: -10px; width: 20px; height: 20px;"
  ></div>
</div>
```

--------------------------------

TITLE: Zustand createContext Basic Setup
DESCRIPTION: Demonstrates the fundamental setup of Zustand's `createContext` for creating a store provider and using the `useStore` hook to access state slices. Note: This API is deprecated from v4.

SOURCE: https://zustand.docs.pmnd.rs/previous-versions/zustand-v3-create-context

LANGUAGE: javascript
CODE:
```
import create from 'zustand'
import createContext from 'zustand/context'

const { Provider, useStore } = createContext()

const createStore = () => create(...)

const App = () => (
  <Provider createStore={createStore}>
    ...
  </Provider>
)

const Component = () => {
  const state = useStore()
  const slice = useStore(selector)
  ...

}
```

--------------------------------

TITLE: Complete Zustand Store Implementation with Persistence and Rendering (TypeScript)
DESCRIPTION: Combines the setup of a Zustand vanilla store with persistence, mouse tracking, and visual rendering. This is the full example demonstrating the persistence and rehydration flow.

SOURCE: https://zustand.docs.pmnd.rs/middlewares/persist

LANGUAGE: typescript
CODE:
```
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'position-storage',
      skipHydration: true,
    },
  ),
)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

setTimeout(() => {
  positionStore.persist.rehydrate()
}, 2000)

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)

```

--------------------------------

TITLE: Usage: Global Vanilla Store Example
DESCRIPTION: Example demonstrating how to set up and use a global vanilla Zustand store with useStoreWithEqualityFn in a React application.

SOURCE: https://zustand.docs.pmnd.rs/hooks/use-store-with-equality-fn

LANGUAGE: APIDOC
CODE:
```
## Usage: Global Vanilla Store

### Description
This example shows how to create a global store to manage the position of a dot on the screen and update it using `useStoreWithEqualityFn`.

### Setup Store
```javascript
import { createStore } from 'zustand'

type PositionStoreState = { position: { x: number; y: number } }
type PositionStoreActions = { setPosition: (nextPosition: PositionStoreState['position']) => void }
type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set({ position }),
}))
```

### MovingDot Component
```javascript
import { useStoreWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow'

function MovingDot() {
  const position = useStoreWithEqualityFn(
    positionStore,
    (state) => state.position,
    shallow,
  )
  const setPosition = useStoreWithEqualityFn(
    positionStore,
    (state) => state.setPosition,
    shallow,
  )

  return (
    <div
      onPointerMove={(e) => {
        setPosition({
          x: e.clientX,
          y: e.clientY,
        })
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}>
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}/>
    </div>
  )
}
```

### App Component
```javascript
export default function App() {
  return <MovingDot />
}
```

### Full Code Example
```javascript
import { createStore } from 'zustand'
import { useStoreWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow'

type PositionStoreState = { position: { x: number; y: number } }
type PositionStoreActions = { setPosition: (nextPosition: PositionStoreState['position']) => void }
type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set({ position }),
}))

function MovingDot() {
  const position = useStoreWithEqualityFn(
    positionStore,
    (state) => state.position,
    shallow,
  )
  const setPosition = useStoreWithEqualityFn(
    positionStore,
    (state) => state.setPosition,
    shallow,
  )

  return (
    <div
      onPointerMove={(e) => {
        setPosition({
          x: e.clientX,
          y: e.clientY,
        })
      }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}>
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}/>
    </div>
  )
}

export default function App() {
  return <MovingDot />
}
```
```

--------------------------------

TITLE: Zustand State Management Example
DESCRIPTION: Demonstrates creating a Zustand store with state and actions, and accessing it within a React component using selectors for optimized renders.

SOURCE: https://zustand.docs.pmnd.rs/getting-started/comparison

LANGUAGE: javascript
CODE:
```
import { create } from 'zustand'

type State = {
  count: number
}

type Actions = {
  updateCount: (
    countCallback: (count: State['count']) => State['count'],
  ) => void
}

const useCountStore = create<State & Actions>((set) => ({
  count: 0,
  updateCount: (countCallback) =>
    set((state) => ({ count: countCallback(state.count) })),
}))

const Component = () => {
  const count = useCountStore((state) => state.count)
  const updateCount = useCountStore((state) => state.updateCount)
  // ...
}
```

--------------------------------

TITLE: Complete Zustand Store Setup with Persistence and Migration
DESCRIPTION: The full implementation of a Zustand store using `createStore` and `persist` middleware. It includes state and action definitions, initial state setup, and the migration logic from version 0 to 1.

SOURCE: https://zustand.docs.pmnd.rs/middlewares/persist

LANGUAGE: javascript
CODE:
```
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

// For tutorial purposes only
if (!localStorage.getItem('position-storage')) {
  localStorage.setItem(
    'position-storage',
    JSON.stringify({
      state: { x: 100, y: 100 },
      version: 0,
    }),
  )
}

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 }, // version 0: just x: 0, y: 0
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'position-storage',
      version: 1,
      migrate: (persisted: any, version) => {
        if (version === 0) {
          persisted.position = { x: persisted.x, y: persisted.y }
          delete persisted.x
          delete persisted.y
        }

        return persisted
      },
    },
  ),
)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

--------------------------------

TITLE: Complete Zustand Example with Provider and Hook Consumer
DESCRIPTION: A complete React example showcasing the `BearProvider` wrapper and a `HookConsumer` component that utilizes the custom Zustand context hook for state management. Dependencies: 'react', 'zustand'.

SOURCE: https://zustand.docs.pmnd.rs/guides/initialize-state-with-props

LANGUAGE: javascript
CODE:
```
// Provider wrapper & custom hook consumer
function App2() {
  return (
    <BearProvider bears={2}>
      <HookConsumer />
    </BearProvider>
  )
}

```

--------------------------------

TITLE: Jest Setup File
DESCRIPTION: A minimal setup file for Jest tests, importing '@testing-library/jest-dom' to provide custom DOM matchers for better assertion capabilities in testing React components.

SOURCE: https://zustand.docs.pmnd.rs/guides/testing

LANGUAGE: typescript
CODE:
```
// setup-jest.ts
import '@testing-library/jest-dom'

```

--------------------------------

TITLE: Zustand Vanilla Store Definition
DESCRIPTION: An example interface and vanilla store definition using `createStore` from Zustand. It includes state properties and actions similar to the React example.

SOURCE: https://zustand.docs.pmnd.rs/guides/auto-generating-selectors

LANGUAGE: typescript
CODE:
```
import { createStore } from 'zustand'

interface BearState {
  bears: number
  increase: (by: number) => void
  increment: () => void
}

const store = createStore<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
  increment: () => set((state) => ({ bears: state.bears + 1 })),
}))

```

--------------------------------

TITLE: Zustand Devtools Middleware Usage Example
DESCRIPTION: Demonstrates how to apply the `devtools` middleware to a Zustand store for debugging. It includes setting up a basic store with actions and integrating the middleware with optional configurations.

SOURCE: https://zustand.docs.pmnd.rs/middlewares/devtools

LANGUAGE: javascript
CODE:
```
import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

type JungleStore = {
  bears: number
  addBear: () => void
  fishes: number
  addFish: () => void
}

const useJungleStore = create<JungleStore>()(
  devtools((set) => ({
    bears: 0,
    addBear: () =>
      set((state) => ({ bears: state.bears + 1 }), undefined, 'jungle/addBear'),
    fishes: 0,
    addFish: () =>
      set(
        (state) => ({ fishes: state.fishes + 1 }),
        undefined,
        'jungle/addFish',
      ),
  })),
)
```

--------------------------------

TITLE: Vanilla Redux Store Setup and Usage
DESCRIPTION: Illustrates setting up a basic Redux store using createStore and a reducer function. It shows how to access state using useSelector and dispatch actions using useDispatch within a React component.

SOURCE: https://zustand.docs.pmnd.rs/getting-started/comparison

LANGUAGE: typescript
CODE:
```
import { createStore } from 'redux'
import { useSelector, useDispatch } from 'react-redux'

type State = {
  count: number
}

type Action = {
  type: 'increment' | 'decrement'
  qty: number
}

const countReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + action.qty }
    case 'decrement':
      return { count: state.count - action.qty }
    default:
      return state
  }
}

const countStore = createStore(countReducer)

const Component = () => {
  const count = useSelector((state) => state.count)
  const dispatch = useDispatch()
  // ...
```

--------------------------------

TITLE: Redux Toolkit Store Setup and Usage
DESCRIPTION: Demonstrates creating a Redux store with Redux Toolkit using createSlice and configureStore. It shows how to define reducers and actions within a slice, and access state and dispatch actions using custom hooks with TypeScript typings.

SOURCE: https://zustand.docs.pmnd.rs/getting-started/comparison

LANGUAGE: typescript
CODE:
```
import { useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import { createSlice, configureStore } from '@reduxjs/toolkit'

const countSlice = createSlice({
  name: 'count',
  initialState: { value: 0 },
  reducers: {
    incremented: (state, qty: number) => {
      // Redux Toolkit does not mutate the state, it uses the Immer library
      // behind scenes, allowing us to have something called "draft state".
      state.value += qty
    },
    decremented: (state, qty: number) => {
      state.value -= qty
    },
  },
})

const countStore = configureStore({ reducer: countSlice.reducer })

const useAppSelector: TypedUseSelectorHook<typeof countStore.getState> =
  useSelector

const useAppDispatch: () => typeof countStore.dispatch = useDispatch

const Component = () => {
  const count = useAppSelector((state) => state.count.value)
  const dispatch = useAppDispatch()
  // ...
```

--------------------------------

TITLE: HTML for Zustand Redux Example
DESCRIPTION: Provides the necessary HTML structure for the Zustand Redux middleware example, including input fields for name and email, and a display area for the results.

SOURCE: https://zustand.docs.pmnd.rs/middlewares/redux

LANGUAGE: html
CODE:
```
<label style="display: block">
  First name:
  <input id="first-name" />
</label>
<label style="display: block">
  Last name:
  <input id="last-name" />
</label>
<label style="display: block">
  Email:
  <input id="email" />
</label>
<p id="result"></p>

```

--------------------------------

TITLE: Install Immer Middleware
DESCRIPTION: Installs Immer as a direct dependency for use with Zustand. This is a prerequisite for utilizing the Immer middleware.

SOURCE: https://zustand.docs.pmnd.rs/integrations/immer-middleware

LANGUAGE: bash
CODE:
```
npm install immer
```

--------------------------------

TITLE: HTML Structure for Zustand Example
DESCRIPTION: Provides the necessary HTML structure for the Zustand subscribeWithSelector example, including a container and a draggable dot element.

SOURCE: https://zustand.docs.pmnd.rs/middlewares/subscribe-with-selector

LANGUAGE: html
CODE:
```
<div
  id="dot-container"
  style="position: relative; width: 100vw; height: 100vh;"
>
  <div
    id="dot"
    style="position: absolute; background-color: red; border-radius: 50%; left: -10px; top: -10px; width: 20px; height: 20px;"
  ></div>
</div>

```

--------------------------------

TITLE: Complete example: Zustand store with persistence and UI updates (TypeScript/JavaScript)
DESCRIPTION: Combines all functionalities: initializing localStorage, creating a persistent Zustand store with deep merging, tracking mouse movements, and updating a UI element accordingly. This provides a full, runnable example.

SOURCE: https://zustand.docs.pmnd.rs/middlewares/persist

LANGUAGE: typescript
CODE:
```
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'
import createDeepMerge from '@fastify/deepmerge'

const deepMerge = createDeepMerge({ all: true })

// For tutorial purposes only
if (!localStorage.getItem('position-storage')) {
  localStorage.setItem(
    'position-storage',
    JSON.stringify({
      state: { position: { y: 100 } }, // missing `x` field
      version: 0,
    }),
  )
}

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    {
      name: 'position-storage',
      merge: (persisted, current) => deepMerge(current, persisted) as never,
    },
  ),
)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  console.log({ state })
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)
```

--------------------------------

TITLE: Full Example: Scoped Zustand Store in React
DESCRIPTION: Provides a complete, runnable example combining all previously defined parts: store creation, context provider, custom hook, `MovingDot` component, and the main `App` component. It includes necessary imports from React and Zustand.

SOURCE: https://zustand.docs.pmnd.rs/hooks/use-store

LANGUAGE: typescript
CODE:
```
import { type ReactNode, useState, createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const createPositionStore = () => {
  return createStore<PositionStore>()((set) => ({
    position: { x: 0, y: 0 },
    setPosition: (position) => set({ position }),
  }))
}

const PositionStoreContext = createContext<ReturnType<
  typeof createPositionStore
> | null>(null)

function PositionStoreProvider({ children }: { children: ReactNode }) {
  const [positionStore] = useState(createPositionStore)

  return (
    <PositionStoreContext.Provider value={positionStore}>
      {children}
    </PositionStoreContext.Provider>
  )
}

function usePositionStore<U>(selector: (state: PositionStore) => U) {
  const store = useContext(PositionStoreContext)

  if (store === null) {
    throw new Error(
      'usePositionStore must be used within PositionStoreProvider',
    )
  }

  return useStore(store, selector)
}

function MovingDot({ color }: { color: string }) {
  const position = usePositionStore((state) => state.position)
  const setPosition = usePositionStore((state) => state.setPosition)

  return (
    <div
      onPointerMove={(e) => {
        setPosition({
          x:
            e.clientX > e.currentTarget.clientWidth
              ? e.clientX - e.currentTarget.clientWidth
              : e.clientX,
          y: e.clientY,
        })
      }}
      style={{
        position: 'relative',
        width: '50vw',
        height: '100vh',
      }}>
      <div
        style={{
          position: 'absolute',
          backgroundColor: color,
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}/>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ display: 'flex' }}>
      <PositionStoreProvider>
        <MovingDot color="red" />
      </PositionStoreProvider>
      <PositionStoreProvider>
        <MovingDot color="blue" />
      </PositionStoreProvider>
    </div>
  )
}
```

--------------------------------

TITLE: Build and Run SSR Server
DESCRIPTION: Commands to compile the TypeScript code and run the Express server. Assumes a setup where 'tsc --build' compiles the project and 'node server.js' starts the server.

SOURCE: https://zustand.docs.pmnd.rs/guides/ssr-and-hydration

LANGUAGE: shell
CODE:
```
tsc --build
```

LANGUAGE: shell
CODE:
```
node server.js
```

--------------------------------

TITLE: Zustand Unsoundness Example with Synchronous get()
DESCRIPTION: Demonstrates a potential unsoundness in Zustand's type implementation where calling `get()` synchronously during initial state creation can lead to runtime errors. This is due to the difficulty in precisely typing the `get` function's behavior.

SOURCE: https://zustand.docs.pmnd.rs/guides/typescript

LANGUAGE: typescript
CODE:
```
import { create } from 'zustand'

const useBoundStore = create<{ foo: number }>()((_, get) => ({
  foo: get().foo,
}))

// This code compiles, but running it can cause an exception:
// "Uncaught TypeError: Cannot read properties of undefined (reading 'foo')"

```

--------------------------------

TITLE: Zustand Single Store Approach
DESCRIPTION: Illustrates Zustand's single store architecture, where all application state is managed within one store. This example shows how to define state and an action to update it.

SOURCE: https://zustand.docs.pmnd.rs/getting-started/comparison

LANGUAGE: typescript
CODE:
```
import { create } from 'zustand'

type State = {
  count: number
}

type Actions = {
  updateCount: (
    countCallback: (count: State['count']) => State['count'],
  ) => void
}

const useCountStore = create<State & Actions>((set) => ({
  count: 0,
  updateCount: (countCallback) =>
    set((state) => ({ count: countCallback(state.count) })),
}))

```

--------------------------------

TITLE: Zustand Basic Persist Example
DESCRIPTION: A simple example demonstrating how to use the Persist middleware with a JSON storage to persist a bear counter state. It includes setting a storage name and optionally specifying a storage like sessionStorage.

SOURCE: https://zustand.docs.pmnd.rs/integrations/persisting-store-data

LANGUAGE: javascript
CODE:
```
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useBearStore = create()(
  persist(
    (set, get) => ({
      bears: 0,
      addABear: () => set({ bears: get().bears + 1 }),
    }),
    {
      name: 'food-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)
```

--------------------------------

TITLE: Zustand Store Setup and Usage
DESCRIPTION: Demonstrates how to create a Zustand store with state and actions, and how to access state and actions within a React component using selectors. It shows basic increment and decrement functionality.

SOURCE: https://zustand.docs.pmnd.rs/getting-started/comparison

LANGUAGE: typescript
CODE:
```
import { create } from 'zustand'

type State = {
  count: number
}

type Actions = {
  increment: (qty: number) => void
  decrement: (qty: number) => void
}

const useCountStore = create<State & Actions>((set) => ({
  count: 0,
  increment: (qty: number) => set((state) => ({ count: state.count + qty })),
  decrement: (qty: number) => set((state) => ({ count: state.count - qty })),
}))

const Component = () => {
  const count = useCountStore((state) => state.count)
  const increment = useCountStore((state) => state.increment)
  const decrement = useCountStore((state) => state.decrement)
  // ...
}
```

--------------------------------

TITLE: Zustand TypeScript Persist Example
DESCRIPTION: This example shows how to use the Persist middleware with TypeScript, defining the store's state and actions using types for better code safety and clarity.

SOURCE: https://zustand.docs.pmnd.rs/integrations/persisting-store-data

LANGUAGE: typescript
CODE:
```
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type BearStore = {
  bears: number
  addABear: () => void
}

export const useBearStore = create<BearStore>()(
  persist(
    (set, get) => ({
      bears: 0,
      addABear: () => set({ bears: get().bears + 1 }),
    }),
    {
      name: 'food-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)
```

--------------------------------

TITLE: Jotai State Management Example
DESCRIPTION: Illustrates Jotai's atom-based state management, showing how to define an atom and use the useAtom hook in a React component.

SOURCE: https://zustand.docs.pmnd.rs/getting-started/comparison

LANGUAGE: javascript
CODE:
```
import { atom, useAtom } from 'jotai'

const countAtom = atom<number>(0)

const Component = () => {
  const [count, updateCount] = useAtom(countAtom)
  // ...
}
```

--------------------------------

TITLE: Zustand Devtools with Slices Pattern Example
DESCRIPTION: Illustrates using the `devtools` middleware with a Zustand store structured using the slices pattern. This example shows how to combine multiple slice creators while maintaining Redux DevTools integration.

SOURCE: https://zustand.docs.pmnd.rs/middlewares/devtools

LANGUAGE: javascript
CODE:
```
import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

type BearSlice = {
  bears: number
  addBear: () => void
}

type FishSlice = {
  fishes: number
  addFish: () => void
}

type JungleStore = BearSlice & FishSlice

const createBearSlice: StateCreator<
  JungleStore,
  [['zustand/devtools', never]],
  [],
  BearSlice
> = (set) => ({
  bears: 0,
  addBear: () =>
    set(
      (state) => ({ bears: state.bears + 1 }),
      undefined,
      'jungle:bear/addBear',
    ),
})

const createFishSlice: StateCreator<
  JungleStore,
  [['zustand/devtools', never]],
  [],
  FishSlice
> = (set) => ({
  fishes: 0,
  addFish: () =>
    set(
      (state) => ({ fishes: state.fishes + 1 }),
      undefined,
      'jungle:fish/addFish',
    ),
})

const useJungleStore = create<JungleStore>()(
  devtools((...args) => ({
    ...createBearSlice(...args),
    ...createFishSlice(...args),
  })),
)
```

--------------------------------

TITLE: Complete Zustand Position Tracker Example
DESCRIPTION: Combines the initialization of the Zustand store with persist middleware, the event listener for mouse movement tracking, and the subscription for rendering the position updates. This provides a full implementation of a persisting position tracker.

SOURCE: https://zustand.docs.pmnd.rs/middlewares/persist

LANGUAGE: javascript
CODE:
```
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    { name: 'position-storage' },
  ),
)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)

```

--------------------------------

TITLE: Full Example: Mouse Following Dot with Zustand Persistence (JavaScript)
DESCRIPTION: Combines store creation, event listening, and UI rendering for a mouse-following dot. This complete script demonstrates persistent state management using Zustand with partial `localStorage` saving.

SOURCE: https://zustand.docs.pmnd.rs/middlewares/persist

LANGUAGE: javascript
CODE:
```
import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

type PositionStoreState = {
  context: {
    position: { x: number; y: number }
  }
}

type PositionStoreActions = {
  actions: {
    setPosition: (
      nextPosition: PositionStoreState['context']['position'],
    ) => void
  }
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      context: {
        position: { x: 0, y: 0 },
      },
      actions: {
        setPosition: (position) => set({ context: { position } }),
      },
    }),
    {
      name: 'position-storage',
      partialize: (state) => ({ context: state.context }),
    },
  ),
)

const $dotContainer = document.getElementById('dot-container') as HTMLDivElement
const $dot = document.getElementById('dot') as HTMLDivElement

$dotContainer.addEventListener('pointermove', (event) => {
  positionStore.getState().actions.setPosition({
    x: event.clientX,
    y: event.clientY,
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.context.position.x}px, ${state.context.position.y}px)`
}

render(positionStore.getState(), positionStore.getState())

positionStore.subscribe(render)

```

--------------------------------

TITLE: Zustand Vanilla Store with subscribeWithSelector Example
DESCRIPTION: Demonstrates how to use the subscribeWithSelector middleware with a vanilla Zustand store to manage and subscribe to partial state updates. It includes setting up the store, updating state on mouse enter events, rendering the state, and logging specific state changes.

SOURCE: https://zustand.docs.pmnd.rs/middlewares/subscribe-with-selector

LANGUAGE: javascript
CODE:
```
import { createStore } from 'zustand/vanilla'
import { subscribeWithSelector } from 'zustand/middleware'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()(
  subscribeWithSelector((set) => ({
    position: { x: 0, y: 0 },
    setPosition: (position) => set({ position }),
  }))
)

const $dot = document.getElementById('dot') as HTMLDivElement

$dot.addEventListener('mouseenter', (event) => {
  const parent = event.currentTarget.parentElement
  const parentWidth = parent.clientWidth
  const parentHeight = parent.clientHeight

  positionStore.getState().setPosition({
    x: Math.ceil(Math.random() * parentWidth),
    y: Math.ceil(Math.random() * parentHeight),
  })
})

const render: Parameters<typeof positionStore.subscribe>[0] = (state) => {
  $dot.style.transform = `translate(${state.position.x}px, ${state.position.y}px)`
}

render(positionStore.getInitialState(), positionStore.getInitialState())

positionStore.subscribe((state) => state.position, render)

const logger: Parameters<typeof positionStore.subscribe>[0] = (x) => {
  console.log('new x position', { x })
}

positionStore.subscribe((state) => state.position.x, logger)

```

--------------------------------

TITLE: Zustand Persist API: Hydration Start Listener
DESCRIPTION: Explains how to subscribe to a listener that is called when the hydration process begins, using the `onHydrate` method. It also shows how to unsubscribe from the listener.

SOURCE: https://zustand.docs.pmnd.rs/integrations/persisting-store-data

LANGUAGE: javascript
CODE:
```
const unsub = useBoundStore.persist.onHydrate((state) => {
  console.log('hydration starts')
})

// later on...
unsub()

```

--------------------------------

TITLE: Setup Vitest with Jest DOM and Mocking Zustand
DESCRIPTION: This setup file configures Vitest for testing by importing '@testing-library/jest-dom' for DOM assertion matchers and uses `vi.mock('zustand')` to automatically mock the Zustand library, similar to how Jest handles auto-mocking.

SOURCE: https://zustand.docs.pmnd.rs/guides/testing

LANGUAGE: typescript
CODE:
```
// setup-vitest.ts
import '@testing-library/jest-dom'

vi.mock('zustand') // to make it work like Jest (auto-mocking)

```

--------------------------------

TITLE: Vitest Test Setup Requirement
DESCRIPTION: When globals configuration is not enabled in Vitest, it's necessary to explicitly import testing utilities like describe, test, and expect at the beginning of each test file.

SOURCE: https://zustand.docs.pmnd.rs/guides/testing

LANGUAGE: javascript
CODE:
```
import { describe, test, expect } from 'vitest'
```

--------------------------------

TITLE: Zustand Vanilla Store Setup for Position
DESCRIPTION: Demonstrates the creation of a Zustand vanilla store to manage the `x` and `y` coordinates of an object. It includes the state definition and an action to update the position.

SOURCE: https://zustand.docs.pmnd.rs/hooks/use-store-with-equality-fn

LANGUAGE: typescript
CODE:
```
import { createStore } from 'zustand'

type PositionStoreState = { position: { x: number; y: number } }

type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const positionStore = createStore<PositionStore>()((set) => ({
  position: { x: 0, y: 0 },
  setPosition: (position) => set({ position }),
}))
```

--------------------------------

TITLE: App Component Setup
DESCRIPTION: The main App component that renders the Tabs component within the CounterStoresProvider. This ensures that the context is available for all child components that need to access the scoped stores.

SOURCE: https://zustand.docs.pmnd.rs/hooks/use-store

LANGUAGE: typescript
CODE:
```
import React from 'react';
// Assuming CounterStoresProvider and Tabs are defined correctly

export default function App() {
  return (
    <CounterStoresProvider>
      <Tabs />
    </CounterStoresProvider>
  )
}
```

--------------------------------

TITLE: Use Redux Middleware with Zustand
DESCRIPTION: Illustrates the integration of Zustand with Redux middleware. This setup simplifies the process by wiring up a main reducer, setting initial state, and adding a `dispatch` function to the state and the vanilla API.

SOURCE: https://zustand.docs.pmnd.rs/guides/flux-inspired-practice

LANGUAGE: javascript
CODE:
```
import { redux } from 'zustand/middleware'

const useReduxStore = create(redux(reducer, initialState))
```

--------------------------------

TITLE: Zustand Store Setup with Computed State
DESCRIPTION: Sets up a Zustand store to manage bear-related meal information. This example defines a store `useMeals` with initial values for papaBear, mamaBear, and littleBear. It also includes a `BearNames` component that subscribes to the store and displays the keys (bear names) from the state.

SOURCE: https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow

LANGUAGE: javascript
CODE:
```
import { create } from 'zustand'

const useMeals = create(() => ({
  papaBear: 'large porridge-pot',
  mamaBear: 'middle-size porridge pot',
  littleBear: 'A little, small, wee pot',
}))

export const BearNames = () => {
  const names = useMeals((state) => Object.keys(state))

  return <div>{names.join(', ')}</div>
}
```

--------------------------------

TITLE: Redux: Counter Store with Redux Toolkit
DESCRIPTION: Shows how to create a counter store using Redux Toolkit's `createSlice` and `configureStore`. This modern approach simplifies Redux setup by defining reducers and actions within a slice, leveraging Immer for immutable state updates.

SOURCE: https://zustand.docs.pmnd.rs/getting-started/comparison

LANGUAGE: typescript
CODE:
```
import { createSlice, configureStore } from '@reduxjs/toolkit'

const countSlice = createSlice({
  name: 'count',
  initialState: { value: 0 },
  reducers: {
    incremented: (state, qty: number) => {
      // Redux Toolkit does not mutate the state, it uses the Immer library
      // behind scenes, allowing us to have something called "draft state".
      state.value += qty
    },
    decremented: (state, qty: number) => {
      state.value -= qty
    },
  },
})

const countStore = configureStore({ reducer: countSlice.reducer })

```

--------------------------------

TITLE: Home Page Component (Pages Router) - TypeScript/React
DESCRIPTION: This component displays a counter and provides buttons to increment or decrement its value. It utilizes the `useCounterStore` hook from the provided counter store to access and modify the state. This example is for a Pages Router setup in Next.js.

SOURCE: https://zustand.docs.pmnd.rs/guides/nextjs

LANGUAGE: tsx
CODE:
```
// src/components/pages/home-page.tsx
import { useCounterStore } from '@/providers/counter-store-provider.ts'

export const HomePage = () => {
  const { count, incrementCount, decrementCount } = useCounterStore(
    (state) => state,
  )

  return (
    <div>
      Count: {count}
      <hr />
      <button type="button" onClick={incrementCount}>
        Increment Count
      </button>
      <button type="button" onClick={decrementCount}>
        Decrement Count
      </button>
    </div>
  )
}
```

--------------------------------

TITLE: Subscribe to Zustand State Updates
DESCRIPTION: This example shows how to subscribe to state updates in Zustand. A callback function is registered to fire whenever the store's state changes, useful for external state management.

SOURCE: https://zustand.docs.pmnd.rs/apis/create-with-equality-fn

LANGUAGE: jsx
CODE:
```
import { useEffect } from 'react'
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/vanilla/shallow'

type PositionStoreState = { position: { x: number; y: number } }
type PositionStoreActions = {
  setPosition: (nextPosition: PositionStoreState['position']) => void
}
type PositionStore = PositionStoreState & PositionStoreActions

const usePositionStore = createWithEqualityFn<PositionStore>()(
  (set) => ({
    position: { x: 0, y: 0 },
    setPosition: (nextPosition) => set({ position: nextPosition }),
  }),
  shallow,
)

export default function MovingDot() {
  const position = usePositionStore((state) => state.position)
  const setPosition = usePositionStore((state) => state.setPosition)

  useEffect(() => {
    const unsubscribePositionStore = usePositionStore.subscribe(
      ({ position }) => {
        console.log('new position', { position })
      },
    )

    return () => {
      unsubscribePositionStore()
    }
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}
        onMouseEnter={(event) => {
          const parent = event.currentTarget.parentElement
          const parentWidth = parent.clientWidth
          const parentHeight = parent.clientHeight

          setPosition({
            x: Math.ceil(Math.random() * parentWidth),
            y: Math.ceil(Math.random() * parentHeight),
          })
        }}
      />
    </div>
  )
}
```

--------------------------------

TITLE: Valtio Mutable State Model Example
DESCRIPTION: Illustrates using Valtio with a mutable state model. The `proxy` function creates a mutable state object, allowing direct modification of nested properties.

SOURCE: https://zustand.docs.pmnd.rs/getting-started/comparison

LANGUAGE: typescript
CODE:
```
import { proxy } from 'valtio'

const state = proxy({ obj: { count: 0 } })

state.obj.count += 1

```

--------------------------------

TITLE: Zustand Workaround for Dynamic Replace Flag Example
DESCRIPTION: A complete example demonstrating the workaround for handling dynamic `replace` flags in Zustand's `setState`. It includes store definition and the dynamic flag application using type assertions.

SOURCE: https://zustand.docs.pmnd.rs/guides/typescript

LANGUAGE: typescript
CODE:
```
import { create } from 'zustand'

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))

const replaceFlag = Math.random() > 0.5
const args = [{ bears: 5 }, replaceFlag] as Parameters<
  typeof useBearStore.setState
>
useBearStore.setState(...args) // Using the workaround

```

--------------------------------

TITLE: Using Immer Middleware in Zustand
DESCRIPTION: This snippet demonstrates how to apply the immer middleware to a Zustand state creator function for immutable updates. Ensure the 'immer' library is installed.

SOURCE: https://zustand.docs.pmnd.rs/middlewares/immer

LANGUAGE: javascript
CODE:
```
import { immer } from 'zustand/middleware/immer';

const nextStateCreatorFn = immer(stateCreatorFn);
```

--------------------------------

TITLE: Zustand Store Setup for Tic-Tac-Toe
DESCRIPTION: This code defines a Zustand store using 'create' and 'combine' middleware to manage the 'history' and 'xIsNext' state for a Tic-Tac-Toe game. It includes setters for these state variables.

SOURCE: https://zustand.docs.pmnd.rs/guides/tutorial-tic-tac-toe

LANGUAGE: javascript
CODE:
```
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

const useGameStore = create(
  combine({ history: [Array(9).fill(null)], xIsNext: true }, (set) => {
    return {
      setHistory: (nextHistory) => {
        set((state) => ({
          history:
            typeof nextHistory === 'function'
              ? nextHistory(state.history)
              : nextHistory,
        }))
      },
      setXIsNext: (nextXIsNext) => {
        set((state) => ({
          xIsNext:
            typeof nextXIsNext === 'function'
              ? nextXIsNext(state.xIsNext)
              : nextXIsNext,
        }))
      },
    }
  }),
)

```