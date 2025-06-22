// "use client";
// import { useState } from "react";
// import { Star } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// interface PropertyRatingProps {
//   propertyId: number;
//   onSubmitRating: (rating: number, review: string) => void;
//   isLoading?: boolean;
//   currentRating?: number;
//   currentReview?: string;
// }

// const PropertyRating = ({
//   propertyId,
//   onSubmitRating,
//   isLoading = false,
// }: PropertyRatingProps) => {
//   const [rating, setRating] = useState(currentRating);
//   const [hoveredRating, setHoveredRating] = useState(0);
//   const [review, setReview] = useState(currentReview);
//   const [isExpanded, setIsExpanded] = useState(false);

//   const handleStarClick = (starValue: number) => {
//     setRating(starValue);
//   };

//   const handleStarHover = (starValue: number) => {
//     setHoveredRating(starValue);
//   };

//   const handleStarLeave = () => {
//     setHoveredRating(0);
//   };

//   const handleSubmit = () => {
//     if (rating > 0) {
//       onSubmitRating(rating, review);
//     }
//   };

//   const getStarColor = (starValue: number) => {
//     const displayRating = hoveredRating || rating;
//     return starValue <= displayRating
//       ? "text-yellow-400 fill-yellow-400"
//       : "text-gray-300";
//   };

//   const getRatingText = () => {
//     const displayRating = hoveredRating || rating;
//     switch (displayRating) {
//       case 1:
//         return "Poor";
//       case 2:
//         return "Fair";
//       case 3:
//         return "Good";
//       case 4:
//         return "Very Good";
//       case 5:
//         return "Excellent";
//       default:
//         return "Rate this property";
//     }
//   };

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="text-lg font-semibold">
//           Rate Your Experience
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {/* Star Rating */}
//         <div className="space-y-2">
//           <div className="flex items-center justify-center space-x-1">
//             {[1, 2, 3, 4, 5].map((star) => (
//               <button
//                 key={star}
//                 type="button"
//                 onClick={() => handleStarClick(star)}
//                 onMouseEnter={() => handleStarHover(star)}
//                 onMouseLeave={handleStarLeave}
//                 className="hover:scale-110"
//                 disabled={isLoading}
//               >
//                 <Star className={`w-8 h-8 ${getStarColor(star)} `} />
//               </button>
//             ))}
//           </div>
//           <p className="text-center text-sm text-gray-600 font-medium">
//             {getRatingText()}
//           </p>
//         </div>
//         {/* Submit Button */}
//         <Button
//           onClick={handleSubmit}
//           disabled={rating === 0 || isLoading}
//           className="w-full"
//           variant={rating === 0 ? "outline" : "default"}
//         >
//           {isLoading ? (
//             <div className="flex items-center space-x-2">
//               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//               <span>Submitting...</span>
//             </div>
//           ) : currentRating > 0 ? (
//             "Update Rating"
//           ) : (
//             "Submit Rating"
//           )}
//         </Button>

//         {/* Current Rating Display */}
//         {currentRating > 0 && (
//           <div className="pt-2 border-t border-gray-200">
//             <p className="text-sm text-gray-600 mb-1">Your current rating:</p>
//             <div className="flex items-center space-x-1">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <Star
//                   key={star}
//                   className={`w-4 h-4 ${
//                     star <= currentRating
//                       ? "text-yellow-400 fill-yellow-400"
//                       : "text-gray-300"
//                   }`}
//                 />
//               ))}
//               <span className="ml-2 text-sm font-medium text-gray-700">
//                 {currentRating}/5
//               </span>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default PropertyRating;
