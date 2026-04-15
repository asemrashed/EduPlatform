# Reusable Modal Components

This directory contains a set of reusable modal components that can be used throughout the application for consistent UI and better user experience.

## Components

### 1. Modal (Base Component)
The base modal component that provides the foundation for all other modal types.

**Props:**
- `open: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal should close
- `title: string` - Modal title
- `description?: string` - Optional description
- `children: ReactNode` - Modal content
- `footer?: ReactNode` - Optional custom footer
- `size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'` - Modal size (default: 'md')
- `showCloseButton?: boolean` - Show/hide close button (default: true)
- `showCancelButton?: boolean` - Show/hide cancel button (default: true)
- `cancelText?: string` - Cancel button text (default: 'Cancel')
- `onCancel?: () => void` - Custom cancel handler
- `className?: string` - Additional CSS classes

**Example:**
```tsx
<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="My Modal"
  description="This is a custom modal"
  size="lg"
>
  <div>Your content here</div>
</Modal>
```

### 2. FormModal
A specialized modal for forms with built-in form handling.

**Props:**
- All Modal props plus:
- `onSubmit: (e: FormEvent) => void` - Form submit handler
- `submitText?: string` - Submit button text (default: 'Save')
- `cancelText?: string` - Cancel button text (default: 'Cancel')
- `loading?: boolean` - Loading state
- `submitVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'` - Submit button style
- `showCancelButton?: boolean` - Show/hide cancel button
- `formId?: string` - Form ID for submit button

**Example:**
```tsx
<FormModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={handleSubmit}
  title="Create User"
  submitText="Create"
  loading={isLoading}
  formId="user-form"
>
  <Input name="name" placeholder="Name" />
  <Input name="email" type="email" placeholder="Email" />
</FormModal>
```

### 3. ConfirmModal
A modal for confirmation dialogs with different variants.

**Props:**
- `open: boolean` - Controls modal visibility
- `onClose: () => void` - Close callback
- `onConfirm: () => void` - Confirm callback
- `title: string` - Modal title
- `description?: string` - Optional description
- `confirmText?: string` - Confirm button text (default: 'Confirm')
- `cancelText?: string` - Cancel button text (default: 'Cancel')
- `variant?: 'danger' | 'warning' | 'success' | 'info'` - Modal variant
- `loading?: boolean` - Loading state
- `children?: ReactNode` - Additional content

**Example:**
```tsx
<ConfirmModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Item"
  description="Are you sure you want to delete this item?"
  variant="danger"
  confirmText="Delete"
/>
```

### 4. InfoModal
A modal for displaying information with different types.

**Props:**
- `open: boolean` - Controls modal visibility
- `onClose: () => void` - Close callback
- `title: string` - Modal title
- `description?: string` - Optional description
- `type?: 'info' | 'success' | 'warning' | 'error'` - Modal type
- `children?: ReactNode` - Additional content
- `buttonText?: string` - Button text (default: 'Got it')
- `onButtonClick?: () => void` - Custom button handler
- `showButton?: boolean` - Show/hide button

**Example:**
```tsx
<InfoModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Success"
  description="Your action was completed successfully!"
  type="success"
  buttonText="Continue"
>
  <div>Additional information here</div>
</InfoModal>
```

## Usage Examples

### Basic Modal
```tsx
import Modal from '@/components/ui/modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal"
        description="This is a basic modal"
      >
        <div>Content here</div>
      </Modal>
    </>
  );
}
```

### Form Modal
```tsx
import FormModal from '@/components/ui/form-modal';

function UserForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Handle form submission
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <FormModal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={handleSubmit}
      title="Create User"
      loading={loading}
      formId="user-form"
    >
      <Input name="name" placeholder="Name" required />
      <Input name="email" type="email" placeholder="Email" required />
    </FormModal>
  );
}
```

### Confirm Modal
```tsx
import ConfirmModal from '@/components/ui/confirm-modal';

function DeleteButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    // Handle deletion
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="destructive">
        Delete
      </Button>
      <ConfirmModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        description="This action cannot be undone."
        variant="danger"
      />
    </>
  );
}
```

## Features

- **Consistent Design**: All modals follow the same design system
- **Accessibility**: Built with proper ARIA attributes and keyboard navigation
- **Responsive**: Works on all screen sizes
- **Customizable**: Extensive customization options
- **TypeScript**: Full TypeScript support
- **Animations**: Smooth transitions and hover effects
- **Loading States**: Built-in loading state support
- **Keyboard Shortcuts**: ESC key to close
- **Multiple Variants**: Different styles for different use cases

## Best Practices

1. **Use the appropriate modal type** for your use case
2. **Always provide clear titles and descriptions**
3. **Use loading states** for async operations
4. **Handle errors gracefully** with proper error messages
5. **Test keyboard navigation** and accessibility
6. **Keep modal content focused** and not too long
7. **Use consistent button text** across your application
