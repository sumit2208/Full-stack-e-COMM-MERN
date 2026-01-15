import React, { useEffect, useState } from "react";

import api from "../api";
import ProductCard from "./Card";
const Products = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const { data } = await api.get("/allproducts");
        if (data.success) {
          setProducts(data.result);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    getAllProducts();
  }, []);
  console.log(products);
  return (
    <>
      <div
        style={{
          padding: 5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ colorr: "white" }}>Products</h1>
        </div>

        <div className="d-flex flex-wrap justify-content-start align-items-center gap-4 p-4 shadow-sm   rounded">
          {products.map((e) => (
            <ProductCard
              key={e._id}
              _id={e._id}
              name={e.name}
              description={e.description}
              stock={e.stock}
              price={e.price}
              DiscountAmount={e.DiscountAmount}
              DiscountedAmount={e.DiscountedAmount}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Products;
