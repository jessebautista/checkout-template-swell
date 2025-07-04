# Swell Custom Checkout Template

A modern, customizable checkout solution for Swell.is stores. This template provides a complete checkout experience that can be easily deployed and customized for any Swell store.

## Features

- 🛒 Complete checkout flow (Customer Info → Shipping → Payment → Review)
- 💳 Multiple payment methods (Stripe, PayPal, Custom)
- 📱 Responsive design with Tailwind CSS
- 🔧 TypeScript for type safety
- ⚡ Built with Vite for fast development
- 🎨 Customizable styling and branding
- 📦 Easy deployment to Vercel, Netlify, or any static host

## Quick Start

1. **Clone this repository**
   ```bash
   git clone <your-repo-url>
   cd swell-custom-checkout
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Swell store credentials:
   ```
   VITE_SWELL_STORE_ID=your-store-id
   VITE_SWELL_PUBLIC_KEY=your-public-key
   ```

4. **Deploy to Vercel (Required for Swell testing)**
   
   ⚠️ **Important**: Swell doesn't allow localhost domains in their dashboard. You must deploy to a live URL to test the checkout.
   
   ### Quick Vercel Deployment:
   
   1. **Push to GitHub**
      ```bash
      git init
      git add .
      git commit -m "Initial commit"
      git branch -M main
      git remote add origin <your-github-repo-url>
      git push -u origin main
      ```
   
   2. **Deploy to Vercel**
      - Go to [vercel.com](https://vercel.com) and sign in
      - Click "New Project"
      - Import your GitHub repository
      - Add environment variables:
        ```
        VITE_SWELL_STORE_ID=your-store-id
        VITE_SWELL_PUBLIC_KEY=your-public-key
        ```
      - Click "Deploy"
      - Your checkout will be live at `https://your-project.vercel.app`
   
   3. **Update Swell Dashboard**
      - Go to your Swell dashboard → Settings → Checkout
      - Set your checkout URL to: `https://your-project.vercel.app/checkout/{checkout_id}`
      - Add your domain to allowed origins in API settings
      - The `{checkout_id}` placeholder will be automatically replaced by Swell

5. **Local Development (Optional)**
   ```bash
   npm run dev
   ```
   
   Note: For local testing with Swell, you'll need to use a tunneling service like ngrok or deploy to a staging environment.

6. **Build for production**
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SWELL_STORE_ID` | Your Swell store ID | Yes |
| `VITE_SWELL_PUBLIC_KEY` | Your Swell public key | Yes |
| `VITE_CHECKOUT_DOMAIN` | Custom checkout domain | No |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No |
| `VITE_PAYPAL_CLIENT_ID` | PayPal client ID | No |

### Swell Dashboard Setup

1. Go to **Settings → Payments** in your Swell dashboard
2. Add a **Custom** payment method
3. Set the payment method name (e.g., "Custom Checkout")
4. Configure your preferred payment gateways

### Checkout URL Configuration

In your Swell dashboard, set your checkout URL to:
```
https://your-project.vercel.app/checkout/{checkout_id}
```

**Supported URL formats:**
- `/checkout/{checkout_id}` - Path parameter (recommended)
- `/checkout?checkout_id=xxx` - Query parameter
- `/checkout?id=xxx` - Alternative query parameter

The template automatically detects and handles all these formats.

## Customization

### Styling

The template uses Tailwind CSS for styling. You can customize:

- **Colors**: Update `tailwind.config.js` to change the primary color scheme
- **Fonts**: Import custom fonts in `src/index.css`
- **Components**: Modify individual components in `src/components/`

### Payment Methods

To add custom payment methods:

1. Update the `PaymentForm` component
2. Add your payment method to the radio button options
3. Implement the payment processing logic
4. Update the Swell cart with the appropriate payment method

### Checkout Flow

The checkout flow is managed by the `useCheckoutSteps` hook. You can:

- Add new steps by updating the `initialSteps` array
- Modify step validation logic
- Customize the step progression

## Deployment

### Vercel (Recommended - Required for Swell)

⚠️ **Important**: Since Swell doesn't allow localhost, Vercel deployment is required for testing.

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a React app

2. **Environment Variables**
   Add these in your Vercel project settings:
   ```
   VITE_SWELL_STORE_ID=your-store-id
   VITE_SWELL_PUBLIC_KEY=your-public-key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key (optional)
   VITE_PAYPAL_CLIENT_ID=your_paypal_id (optional)
   ```

3. **Deploy**
   - Click "Deploy"
   - Your checkout will be live at `https://your-project.vercel.app`

4. **Configure Swell Dashboard**
   - Go to Swell Dashboard → Settings → Checkout
   - Set checkout URL to: `https://your-project.vercel.app/checkout/{checkout_id}`
   - Add domain to CORS origins in API settings
   - The `{checkout_id}` placeholder will be automatically replaced by Swell

5. **Automatic Deployments**
   - Push to main branch triggers automatic deployment
   - Perfect for continuous deployment workflow

### Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Custom Hosting

1. Build the project: `npm run build`
2. Upload the `dist` folder to your hosting provider
3. Configure your web server to serve the static files

## API Integration

### Cart Management

The template uses Swell's cart API:

```typescript
// Update cart with billing info
await swell.cart.update({
  billing: {
    first_name: 'John',
    last_name: 'Doe',
    // ... other fields
  }
})

// Submit order
const order = await swell.cart.submitOrder()
```

### Custom Payment Processing

For custom payment methods, the template supports:

- Authorization and capture workflows
- Webhook integration for payment confirmations
- Custom metadata for payment processing

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Project Structure

```
src/
├── components/          # React components
│   ├── CheckoutSteps.tsx
│   ├── CustomerInfoForm.tsx
│   ├── ShippingForm.tsx
│   ├── PaymentForm.tsx
│   └── OrderReview.tsx
├── hooks/              # Custom React hooks
│   ├── useCart.ts
│   └── useCheckoutSteps.ts
├── lib/                # Utilities and configuration
│   └── swell.ts
├── pages/              # Page components
│   └── CheckoutPage.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
└── App.tsx             # Main App component
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues related to:
- **Swell.is**: Check the [Swell documentation](https://developers.swell.is/)
- **This template**: Open an issue in this repository

## License

MIT License - see LICENSE file for details