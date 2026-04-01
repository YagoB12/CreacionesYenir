using backend_yenir.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_yenir.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ShoppingCart> ShoppingCarts { get; set; }
        public DbSet<ShoppingCartItem> ShoppingCartItems { get; set; }
        public DbSet<Inventory> Inventories { get; set; }

        public DbSet<Payment> Payments { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }

        public DbSet<Bill> Bills { get; set; }

        public DbSet<Order> Orders { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            modelBuilder.Entity<User>().Property(u => u.Role).HasConversion<string>();

            modelBuilder.Entity<Product>().Property(p => p.Category).HasConversion<string>();

            modelBuilder.Entity<Product>().HasIndex(p => p.Category);

            modelBuilder.Entity<Product>().HasIndex(p => p.Name);

            modelBuilder
                .Entity<ShoppingCart>()
                .HasOne(sc => sc.User)
                .WithOne(u => u.ShoppingCart)
                .HasForeignKey<ShoppingCart>(sc => sc.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
                .Entity<ShoppingCartItem>()
                .HasOne(sci => sci.ShoppingCart)
                .WithMany(sc => sc.Items)
                .HasForeignKey(sci => sci.ShoppingCartId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
                .Entity<ShoppingCartItem>()
                .HasOne(sci => sci.Product)
                .WithMany(p => p.ShoppingCartItems)
                .HasForeignKey(sci => sci.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ShoppingCart>().HasIndex(sc => sc.UserId).IsUnique();

            modelBuilder
                .Entity<Payment>()
                .HasOne(p => p.User)
                .WithMany(u => u.Payments)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
                .Entity<OrderDetail>()
                .HasOne(od => od.Payment)
                .WithMany(p => p.OrderDetails)
                .HasForeignKey(od => od.PaymentId);

            modelBuilder
                .Entity<OrderDetail>()
                .HasOne(od => od.Product)
                .WithMany(p => p.OrderDetails)
                .HasForeignKey(od => od.ProductId)
                .OnDelete(DeleteBehavior.NoAction);

            // 1 a 1: Payment y Bill
            modelBuilder
                .Entity<Payment>()
                .HasOne(p => p.Bill)
                .WithOne(b => b.Payment)
                .HasForeignKey<Bill>(b => b.PaymentId)
                .OnDelete(DeleteBehavior.Cascade);

            // para asegurar 1-1
            modelBuilder.Entity<Bill>().HasIndex(b => b.PaymentId).IsUnique();

            modelBuilder
                .Entity<Bill>()
                .HasOne(b => b.Client)
                .WithMany()
                .HasForeignKey(b => b.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder
                .Entity<Payment>()
                .Property(p => p.TotalPrice)
                .HasColumnType("decimal(18,2)");
            //Relacion de 1 a 1 Paymente y Order
            modelBuilder
                .Entity<Payment>()
                .HasOne(p => p.Order)
                .WithOne(o => o.Payment)
                .HasForeignKey<Order>(o => o.PaymentId);

            modelBuilder.Entity<Bill>().Property(b => b.TotalAmount).HasColumnType("decimal(18,2)");
        }
    }
}
