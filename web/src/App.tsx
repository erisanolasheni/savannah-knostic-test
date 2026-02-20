import { Route, Switch } from "wouter";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";

function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Tiny Inventory</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Switch>
          <Route path="/" component={ProductsPage} />
          <Route path="/products/:id" component={ProductDetailPage} />
        </Switch>
      </main>
    </div>
  );
}

export default App;
