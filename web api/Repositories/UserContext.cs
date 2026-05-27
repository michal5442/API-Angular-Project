using Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace Repositories;

public partial class UserContext : DbContext
{
  public UserContext()
  {
  }

  public UserContext(DbContextOptions<UserContext> options)
      : base(options)
  {
  }

  public virtual DbSet<Artist> Artists { get; set; }

  public virtual DbSet<Order> Orders { get; set; }

  public virtual DbSet<OrderItem> OrderItems { get; set; }

  public virtual DbSet<Rating> Ratings { get; set; }

  public virtual DbSet<Song> Songs { get; set; }

  public virtual DbSet<User> Users { get; set; }


  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.Entity<Artist>(entity =>
    {
      entity.HasKey(e => e.ArtistId).HasName("PK__ARTISTS__4A050038BF284D8C");

      entity.ToTable("ARTISTS");

      entity.Property(e => e.ArtistId).HasColumnName("ARTIST_ID");
      entity.Property(e => e.ArtistName)
          .HasMaxLength(200)
          .HasColumnName("ARTIST_NAME");
      entity.Property(e => e.ImageUrl)
          .HasMaxLength(500)
          .HasColumnName("IMAGE_URL");
      entity.Property(e => e.SongsCount)
          .HasDefaultValue(0)
          .HasColumnName("SONGS_COUNT");
    });

    modelBuilder.Entity<Order>(entity =>
    {
      entity.HasKey(e => e.OrderId).HasName("PK__ORDERS__460A9464B5C82FA3");

      entity.ToTable("ORDERS");

      entity.HasIndex(e => e.OrderId, "IX_ORDERS");

      entity.Property(e => e.OrderId).HasColumnName("ORDER_ID");
      entity.Property(e => e.OrderDate)
          .HasDefaultValueSql("(getdate())")
          .HasColumnType("datetime")
          .HasColumnName("ORDER_DATE");
      entity.Property(e => e.OrderSum).HasColumnName("ORDER_SUM");
      entity.Property(e => e.UserId).HasColumnName("USER_ID");

      entity.HasOne(d => d.User).WithMany(p => p.Orders)
          .HasForeignKey(d => d.UserId)
          .OnDelete(DeleteBehavior.ClientSetNull)
          .HasConstraintName("FK_ORDERS_USERS");
    });

    modelBuilder.Entity<OrderItem>(entity =>
    {
      entity.HasKey(e => e.OrderItemId).HasName("PK__ORDER_IT__E15C431694B1D80E");

      entity.ToTable("ORDER_ITEM");

      entity.Property(e => e.OrderItemId).HasColumnName("ORDER_ITEM_ID");
      entity.Property(e => e.OrderId).HasColumnName("ORDER_ID");
      entity.Property(e => e.SongId).HasColumnName("SONG_ID");

      entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
          .HasForeignKey(d => d.OrderId)
          .OnDelete(DeleteBehavior.ClientSetNull)
          .HasConstraintName("FK_ORDER_ITEM_ORDERS");

      entity.HasOne(d => d.Song).WithMany(p => p.OrderItems)
          .HasForeignKey(d => d.SongId)
          .OnDelete(DeleteBehavior.ClientSetNull)
          .HasConstraintName("FK_ORDER_ITEM_SONGS");
    });

    modelBuilder.Entity<Rating>(entity =>
    {
      entity.HasKey(e => e.RatingId).HasName("PK__RATING__1068AE72EA955DB8");

      entity.ToTable("RATING");

      entity.Property(e => e.RatingId).HasColumnName("RATING_ID");
      entity.Property(e => e.Host)
          .HasMaxLength(50)
          .HasColumnName("HOST");
      entity.Property(e => e.Method)
          .HasMaxLength(10)
          .IsFixedLength()
          .HasColumnName("METHOD");
      entity.Property(e => e.Path)
          .HasMaxLength(50)
          .HasColumnName("PATH");
      entity.Property(e => e.RecordDate)
          .HasColumnType("datetime")
          .HasColumnName("Record_Date");
      entity.Property(e => e.Referer)
          .HasMaxLength(100)
          .HasColumnName("REFERER");
      entity.Property(e => e.UserAgent).HasColumnName("USER_AGENT");
    });

    modelBuilder.Entity<Song>(entity =>
    {
      entity.HasKey(e => e.SongId).HasName("PK__SONGS__7FAA8A4E842D7D57");

      entity.ToTable("SONGS");

      entity.Property(e => e.SongId).HasColumnName("SONG_ID");
      entity.Property(e => e.ArtistId).HasColumnName("ARTIST_ID");
      entity.Property(e => e.Description).HasColumnName("DESCRIPTION");
      entity.Property(e => e.Duration)
          .HasDefaultValue(0.0)
          .HasColumnName("DURATION");
      entity.Property(e => e.ImageUrl)
          .HasMaxLength(500)
          .HasColumnName("IMAGE_URL");
      entity.Property(e => e.Price).HasColumnName("PRICE");
      entity.Property(e => e.SongName)
          .HasMaxLength(200)
          .HasColumnName("SONG_NAME");
      entity.Property(e => e.SongUrl)
          .HasMaxLength(500)
          .HasColumnName("SONG_URL");

      entity.HasOne(d => d.ArtistNavigation).WithMany(p => p.Songs)
          .HasForeignKey(d => d.ArtistId)
          .HasConstraintName("FK_SONGS_ARTISTS");
    });

    modelBuilder.Entity<User>(entity =>
    {
      entity.HasKey(e => e.UserId).HasName("PK__USERS__F3BEEBFF7AEB7AEA");

      entity.ToTable("USERS");

      entity.Property(e => e.UserId).HasColumnName("USER_ID");
      entity.Property(e => e.FirstName)
          .HasMaxLength(100)
          .HasColumnName("FIRST_NAME");
      entity.Property(e => e.LastName)
          .HasMaxLength(100)
          .HasColumnName("LAST_NAME");
      entity.Property(e => e.Password)
          .HasMaxLength(255)
          .IsUnicode(false)
          .HasColumnName("PASSWORD");
      entity.Property(e => e.UserName)
          .HasMaxLength(100)
          .HasColumnName("USER_NAME");
    });

    OnModelCreatingPartial(modelBuilder);
  }

  partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
