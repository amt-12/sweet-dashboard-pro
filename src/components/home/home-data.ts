import { useDispatch } from "react-redux";
import { addToCart } from "@/store/slices/cartSlice";
import cakeJpg from "../../assets/cake.jpg";
import chocolateJpg from "../../assets/choclate.jpg";
import pastryJpg from "../../assets/pastery.jpg";
import doJpg from "../../assets/DO.jpg";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  img: string;
  badge?: string;
}

export const useProductActions = () => {
  const dispatch = useDispatch();

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: 10,
      image: product.img
    }));
  };

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
  };

  return { handleAddToCart, scrollTo };
};

export const products = [
  { id: 1, name: "Classic Croissant", category: "Pastries", price: 3.50, img: "/croissant.png", badge: "Bestseller" },
  { id: 2, name: "Strawberry Dream Cake", category: "Cakes", price: 28.00, img: "/cake.png", badge: "New" },
  { id: 3, name: "Rustic Sourdough", category: "Breads", price: 9.00, img: "/bread.png", badge: "Artisan" },
  { id: 4, name: "Chocolate Chip Cookies", category: "Cookies", price: 2.50, img: chocolateJpg, badge: "Classic" },
  { id: 5, name: "Blueberry Muffin", category: "Muffins", price: 3.00, img: cakeJpg, badge: "Fresh" },
  { id: 6, name: "Cinnamon Roll", category: "Pastries", price: 4.00, img: pastryJpg, badge: "Hot" },
  { id: 7, name: "Baguette", category: "Breads", price: 3.00, img: "/bread.png", badge: "Crispy" },
  { id: 8, name: "Cheesecake Slice", category: "Cakes", price: 5.00, img: doJpg, badge: "Creamy" },
];

export const testimonials = [
  { name: "Aisha Patel", role: "Regular Customer", text: "Every morning starts with their croissants. Perfectly flaky, buttery, absolutely divine. Nothing else comes close!", stars: 5 },
  { name: "Marco Rossi", role: "Event Planner", text: "Ordered a custom cake for our corporate event. The team was professional, the cake was spectacular. 10/10.", stars: 5 },
  { name: "Sarah Thompson", role: "Food Blogger", text: "The sourdough here is the real deal — tangy, crusty crust, airy crumb. The best artisan bread in the city.", stars: 5 },
];

export const navLinks = ["Home", "Menu", "About", "Testimonials", "Contact"];
