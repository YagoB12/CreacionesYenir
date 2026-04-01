using System.ComponentModel.DataAnnotations;

namespace backend_yenir.DTOs.ShoppingCart
{
    public class AddToCartDTO
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public int Quantity { get; set; }
    }
}
