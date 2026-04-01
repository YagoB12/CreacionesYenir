using System.ComponentModel.DataAnnotations;
using backend_yenir.Models.Enums;

namespace backend_yenir.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = null!;

        [Required, MaxLength(100)]
        public string LastName { get; set; } = null!;

        [Required]
        public DateTime BirthDay { get; set; }

        [Required, EmailAddress, MaxLength(150)]
        public string Email { get; set; } = null!;

        [Required]
        public string PasswordHash { get; set; } = null!;

        [Required]
        public UserRole Role { get; set; }

        [Required, MaxLength(20)]
        public string PhoneNumber { get; set; } = null!;

        [Required, MaxLength(10)]
        public string Gender { get; set; } = null!;

        [MaxLength(100)]
        public string? Province { get; set; }

        [MaxLength(100)]
        public string? Canton { get; set; }

        [MaxLength(100)]
        public string? District { get; set; }

        [MaxLength(255)]
        public string? ExactAddress { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ShoppingCart? ShoppingCart { get; set; }

        public ICollection<Review>? Reviews { get; set; }

        //Nuevo Payment
        public ICollection<Payment>? Payments { get; set; }
    }
}
