# Point of Sale (POS) Implementation Prompt

## Overview
Implement a complete Point of Sale (POS) system for the Restify frontend application. The system must allow users to create orders for dine-in or takeout, select products from categories, add product extras, manage cart items, and process payments through multiple payment methods.

## Functional Requirements

### Order Type Selection
The system must allow users to select between two order types: "Dine-in" or "Takeout". When "Dine-in" is selected, the user must select an available table from a hardcoded collection of tables. When "Takeout" is selected, the system must request the customer's name as a required field.

### Category Filtering
The system must display a category filter where all available categories are shown. Categories should be stored in a hardcoded collection. When a category is clicked, the product view must filter and display only products assigned to that selected category. The system should allow clearing the filter to show all products again.

### Product Display and Selection
The product view must display all available products (or filtered by category) in a card-based layout. Each product card must include a generic icon, the product name, and the product price. When a user clicks "Add Product" on a product card, a dialog must open to allow selection of product extras.

### Product Extras Selection
The extras dialog must display all available extras for the selected product. Extras should be stored in a hardcoded collection. Users must be able to select multiple extras, and each extra should have an associated price that will be added to the product's base price. After selecting extras and closing the dialog, the product with its selected extras must be added to the order items, and the system must automatically recalculate the subtotal and total.

### Order Items Management
The system must maintain a list of order items in the cart. Each item must include the product information, selected extras, quantity, individual price, and subtotal. Users must be able to modify quantities, remove items, and see real-time updates to the order totals.

### Payment Methods
The system must support two payment methods. When one payment method is selected and a payment amount is entered, the system must automatically calculate the remaining amount for the second payment method (total minus the first payment amount). The second payment method amount must not exceed the remaining total. Both payment methods must be properly validated before the payment button can be enabled.

### Payment Validation
The payment button must remain disabled until all required fields are correctly filled: order type is selected, table is selected (for dine-in) or customer name is provided (for takeout), at least one product is added to the cart, both payment methods have valid amounts entered, the sum of both payment amounts equals the total exactly, and no payment amount exceeds the total. Only when all validations pass should the payment button be enabled.

## Technical Requirements

### Architecture and Design Principles
The implementation must follow SOLID principles wherever possible and adhere to Clean Architecture principles as far as viable. The code must follow the current project standards and conventions established in the codebase.

### Data Storage
All hardcoded data (tables, categories, products, extras) must be stored in collections/constants files within the shared constants directory. These collections should be easily replaceable with API calls in the future without requiring changes to the component logic.

### Code Structure
The implementation must follow the existing project structure:
- Domain layer: Define types, interfaces, and entities for orders, products, categories, tables, and payment methods
- Infrastructure layer: Create repository for order operations (if API integration is needed)
- Application layer: Create service for order business logic, calculations, and validations
- Presentation layer: Create components, hooks, and pages following the existing patterns

### Component Organization
Components must be organized in `src/presentation/components/pos/` directory. Each component should have a single responsibility. Reusable logic should be extracted into custom hooks in `src/presentation/hooks/`. Business logic should reside in services within the application layer.

### State Management
Use React Query for server state management (if API calls are needed), local state for UI interactions, and consider Zustand for complex POS state if necessary. Follow the existing state management patterns in the project.

### Styling
Use Tailwind CSS with the existing theme variables and color system. Components must support both light and dark modes using the CSS variables defined in the project. Follow the existing component styling patterns.

### Type Safety
All code must be fully typed with TypeScript. Avoid using `any` types. Define proper interfaces and types for all data structures, props, and function parameters.

### Error Handling
Implement proper error handling for all user interactions. Display user-friendly error messages using the existing toast notification system (Sonner).

### Validation
Implement client-side validation for all form inputs and user interactions. Validation logic should be centralized in the application service layer where possible.

## Implementation Checklist

- [ ] Create domain types for Order, OrderItem, Product, Category, Table, PaymentMethod, ProductExtra
- [ ] Create constants collections for hardcoded data (tables, categories, extras)
- [ ] Create OrderRepository in infrastructure layer (if API integration needed)
- [ ] Create OrderService in application layer with business logic
- [ ] Create custom hooks for POS state management
- [ ] Create OrderTypeSelector component
- [ ] Create TableSelector component (for dine-in)
- [ ] Create CustomerNameInput component (for takeout)
- [ ] Create CategoryFilter component
- [ ] Create ProductGrid component with product cards
- [ ] Create ProductExtrasDialog component
- [ ] Create Cart component for order items
- [ ] Create OrderSummary component
- [ ] Create PaymentMethods component
- [ ] Create PosPage integrating all components
- [ ] Implement validation logic
- [ ] Implement calculation logic for totals
- [ ] Add error handling and user feedback
- [ ] Ensure responsive design
- [ ] Test light and dark mode compatibility
