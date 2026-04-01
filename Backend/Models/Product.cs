using System.ComponentModel.DataAnnotations;
using backend_yenir.Models.Enums;

namespace backend_yenir.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = null!;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public ProductCategory Category { get; set; }

        [MaxLength(50)]
        public string? Color { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int Stock { get; set; }

        [MaxLength(255)]
        public string? Img { get; set; }

        [MaxLength(100)]
        public string? TypeMaterial { get; set; }

        // Clothing
        [MaxLength(20)]
        public string? Size { get; set; }

        [MaxLength(50)]
        public string? TypeClothes { get; set; }

        [MaxLength(20)]
        public string? TypeGender { get; set; }

        // HomeAccessories
        public decimal? Height { get; set; }

        public decimal? Length { get; set; }

        public decimal? Width { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<ShoppingCartItem> ShoppingCartItems { get; set; } =
            new List<ShoppingCartItem>();

        public ICollection<Review>? Reviews { get; set; }

        //Nuevo
        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
}
