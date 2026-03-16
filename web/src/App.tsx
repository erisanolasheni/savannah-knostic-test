import { Route, Switch } from "wouter";
import { Layout } from "./components";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { AddProductPage } from "./pages/AddProductPage";
import { StoresPage } from "./pages/StoresPage";
import { StoreDetailPage } from "./pages/StoreDetailPage";
import { AddStorePage } from "./pages/AddStorePage";
import { EditStorePage } from "./pages/EditStorePage";
import { StoreProductsPage } from "./pages/StoreProductsPage";

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={ProductsPage} />
        <Route path="/products/new" component={AddProductPage} />
        <Route path="/products/:id" component={ProductDetailPage} />
        <Route path="/stores" component={StoresPage} />
        <Route path="/stores/new" component={AddStorePage} />
        <Route path="/stores/:id/products" component={StoreProductsPage} />
        <Route path="/stores/:id/edit" component={EditStorePage} />
        <Route path="/stores/:id" component={StoreDetailPage} />
      </Switch>
    </Layout>
  );
}

export default App;
