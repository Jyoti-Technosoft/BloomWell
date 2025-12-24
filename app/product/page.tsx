// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useUser } from '../context/UserContext';

// export default function ProductPage({ product }) {
//   const [quantity, setQuantity] = useState(1);
//   const { user } = useUser();
//   const router = useRouter();

//   const addToCart = async () => {
//     if (!user) {
//       router.push(`/auth/signin?callbackUrl=/products/${product.id}`);
//       return;
//     }

//     try {
//       const response = await fetch('/api/cart', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           productId: product.id,
//           quantity,
//         }),
//         credentials: 'include',
//       });

//       if (response.ok) {
//         // Show success message or update cart count
//         alert('Product added to cart!');
//       }
//     } catch (error) {
//       console.error('Failed to add to cart', error);
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="lg:grid lg:grid-cols-2 lg:gap-8">
//         {/* Product image */}
//         <div>
//           <img
//             src={product.image}
//             alt={product.name}
//             className="w-full h-auto rounded-lg"
//           />
//         </div>
        
//         {/* Product details */}
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
//           <p className="mt-4 text-xl text-gray-900">${product.price}</p>
//           <p className="mt-4 text-gray-600">{product.description}</p>
          
//           <div className="mt-8">
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center border border-gray-300 rounded-md">
//                 <button
//                   type="button"
//                   onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                   className="px-4 py-2 text-gray-600 hover:bg-gray-100"
//                 >
//                   -
//                 </button>
//                 <span className="px-4 py-2">{quantity}</span>
//                 <button
//                   type="button"
//                   onClick={() => setQuantity(quantity + 1)}
//                   className="px-4 py-2 text-gray-600 hover:bg-gray-100"
//                 >
//                   +
//                 </button>
//               </div>
              
//               <button
//                 type="button"
//                 onClick={addToCart}
//                 className="flex-1 bg-indigo-600 border border-transparent rounded-md py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 Add to Cart
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }