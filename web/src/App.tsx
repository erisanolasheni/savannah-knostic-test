import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { Layout } from "./components";
import { RouteFallback } from "./components/RouteFallback";
import { Toaster } from "./components/ui/sonner";

const ProductsPage = lazy(() => import("./pages/ProductsPage").then((m) => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })));
const AddProductPage = lazy(() => import("./pages/AddProductPage").then((m) => ({ default: m.AddProductPage })));
const StoresPage = lazy(() => import("./pages/StoresPage").then((m) => ({ default: m.StoresPage })));
const StoreDetailPage = lazy(() => import("./pages/StoreDetailPage").then((m) => ({ default: m.StoreDetailPage })));
const AddStorePage = lazy(() => import("./pages/AddStorePage").then((m) => ({ default: m.AddStorePage })));
const EditStorePage = lazy(() => import("./pages/EditStorePage").then((m) => ({ default: m.EditStorePage })));
const StoreProductsPage = lazy(() => import("./pages/StoreProductsPage").then((m) => ({ default: m.StoreProductsPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));

function App() {
  return (
    <>
      <Layout>
        <Suspense fallback={<RouteFallback />}>
          <Switch>
            <Route path="/" component={ProductsPage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/products/new" component={AddProductPage} />
            <Route path="/products/:id" component={ProductDetailPage} />
            <Route path="/stores" component={StoresPage} />
            <Route path="/stores/new" component={AddStorePage} />
            <Route path="/stores/:id/products" component={StoreProductsPage} />
            <Route path="/stores/:id/edit" component={EditStorePage} />
            <Route path="/stores/:id" component={StoreDetailPage} />
          </Switch>
        </Suspense>
      </Layout>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
