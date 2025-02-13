# BaileysDecorator

## 📌 Introduction

**BaileysDecorator** is a TypeScript library that simplifies event handling for WhatsApp bots using **@whiskeysockets/baileys**. By leveraging decorators, it provides a structured, maintainable, and scalable approach to handling bot events.

## 🚀 Features

- **Automatic decorator detection** from specified directories.
- **Flexible file pattern support** for selecting specific decorators (e.g., `**/*.ts`, `**/*.controller.ts`).
- **Seamless integration with Baileys** for efficient bot automation.
- **Dynamic event binding** for streamlined event handling.
- **Customizable decorator loader** for different project needs.
- **Instance persistence** ensuring correct `this` context in class methods.

## 📦 Installation

```sh
bun add baileys-decorator
```

## 🛠 Usage

### **1. Load Decorators Automatically**

```typescript
import { BaileysDecorator } from 'baileys-decorator';

await BaileysDecorator.loadDecorators([
  './baileys-decorators/example/**/*.action.ts'
]);
```

### **2. Custom Loader for Decorators**

Define a function to handle imported decorators:

```typescript
await BaileysDecorator.loadDecorators([
  './baileys-decorators/example/**/*.ts'
], (files) => {
  console.log("Loaded Files:");
  Object.keys(files).forEach(file => console.log(`✅ ${file}`));
});
```

### **3. Binding Baileys Socket to Events**

Ensure event handlers work correctly with Baileys:

```typescript
import makeWASocket from '@whiskeysockets/baileys';

const socket = makeWASocket({ auth: {} });
BaileysDecorator.bind(socket);
```

## 🎭 Creating Decorators

### **1. Event Handling with `@OnEvent`**

Bind a method to a Baileys event:

```typescript
import { OnEvent, Context } from 'baileys-decorator';

class WhatsAppBot {
  @OnEvent('messages.upsert')
  async handleMessage(@Context eventData) {
    console.log('New message received:', eventData);
  }
}
```

### **2. Text-Based Event Matching with `@OnText`**

Trigger actions based on text patterns:

```typescript
import { OnText } from 'baileys-decorator';

class BotCommands {
  @OnText('/hello')
  async greetUser(@Context message) {
    console.log('User said hello:', message);
  }
}
```

### **3. Using `@Socket` and `@Context` for Dependency Injection**

Inject dependencies into event handlers while maintaining `this` context:

```typescript
import { Socket, Context, OnEvent, OnText } from 'baileys-decorator';

class Bot {
  @OnEvent('messages.upsert')
  async handle(@Socket socket, @Context event) {
    console.log('Socket:', socket);
    console.log('Event:', event);
  }
}
```

### **4. Preserving `this` Context in Class Methods**

BaileysDecorator ensures instance methods maintain `this` when called within decorators:

```typescript
class ExampleBot {
  @OnEvent('messages.upsert')
  async handleMessage(@Context eventData) {
    this.processMessage(eventData);
  }

  processMessage(eventData) {
    console.log('Processing:', eventData);
  }
}
```

## 📝 License

This project is licensed under the **MIT License**.

## 👥 Contributors

- **Binsar Dwi Jasuma** - Creator & Maintainer

## 📩 Contact

For questions, contributions, or feature requests, please open an issue or pull request on GitHub.

