using System;
namespace FaceUPAI.Models
{
	public class Product
	{
		#region Fields

		private int productID;
		private string productName;
		private string shortDescription;
		private string description;
		private string category;
		private string sKU;
		private decimal mRP;
		private decimal sellingPrice;
		private decimal discountPercentage;
		private decimal weight;
		private decimal length;
		private decimal width;
		private decimal height;
		private int stockQuantity;
		private string mainImage;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the Product class.
		/// </summary>
		public Product()
		{
		}

		/// <summary>
		/// Initializes a new instance of the Product class.
		/// </summary>
		public Product(string productName, string shortDescription, string description, string category, string sKU, decimal mRP, decimal sellingPrice, decimal discountPercentage, decimal weight, decimal length, decimal width, decimal height, int stockQuantity, string mainImage, bool isActive, DateTime dateAdded, DateTime dateModified)
		{
			this.productName = productName;
			this.shortDescription = shortDescription;
			this.description = description;
			this.category = category;
			this.sKU = sKU;
			this.mRP = mRP;
			this.sellingPrice = sellingPrice;
			this.discountPercentage = discountPercentage;
			this.weight = weight;
			this.length = length;
			this.width = width;
			this.height = height;
			this.stockQuantity = stockQuantity;
			this.mainImage = mainImage;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
		}

		/// <summary>
		/// Initializes a new instance of the Product class.
		/// </summary>
		public Product(int productID, string productName, string shortDescription, string description, string category, string sKU, decimal mRP, decimal sellingPrice, decimal discountPercentage, decimal weight, decimal length, decimal width, decimal height, int stockQuantity, string mainImage, bool isActive, DateTime dateAdded, DateTime dateModified)
		{
			this.productID = productID;
			this.productName = productName;
			this.shortDescription = shortDescription;
			this.description = description;
			this.category = category;
			this.sKU = sKU;
			this.mRP = mRP;
			this.sellingPrice = sellingPrice;
			this.discountPercentage = discountPercentage;
			this.weight = weight;
			this.length = length;
			this.width = width;
			this.height = height;
			this.stockQuantity = stockQuantity;
			this.mainImage = mainImage;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the ProductID value.
		/// </summary>
		public  int ProductID
		{
			get { return productID; }
			set { productID = value; }
		}

		/// <summary>
		/// Gets or sets the ProductName value.
		/// </summary>
		public  string ProductName
		{
			get { return productName; }
			set { productName = value; }
		}

		/// <summary>
		/// Gets or sets the ShortDescription value.
		/// </summary>
		public  string ShortDescription
		{
			get { return shortDescription; }
			set { shortDescription = value; }
		}

		/// <summary>
		/// Gets or sets the Description value.
		/// </summary>
		public  string Description
		{
			get { return description; }
			set { description = value; }
		}

		/// <summary>
		/// Gets or sets the Category value.
		/// </summary>
		public  string Category
		{
			get { return category; }
			set { category = value; }
		}

		/// <summary>
		/// Gets or sets the SKU value.
		/// </summary>
		public  string SKU
		{
			get { return sKU; }
			set { sKU = value; }
		}

		/// <summary>
		/// Gets or sets the MRP value.
		/// </summary>
		public  decimal MRP
		{
			get { return mRP; }
			set { mRP = value; }
		}

		/// <summary>
		/// Gets or sets the SellingPrice value.
		/// </summary>
		public  decimal SellingPrice
		{
			get { return sellingPrice; }
			set { sellingPrice = value; }
		}

		/// <summary>
		/// Gets or sets the DiscountPercentage value.
		/// </summary>
		public  decimal DiscountPercentage
		{
			get { return discountPercentage; }
			set { discountPercentage = value; }
		}

		/// <summary>
		/// Gets or sets the Weight value.
		/// </summary>
		public  decimal Weight
		{
			get { return weight; }
			set { weight = value; }
		}

		/// <summary>
		/// Gets or sets the Length value.
		/// </summary>
		public  decimal Length
		{
			get { return length; }
			set { length = value; }
		}

		/// <summary>
		/// Gets or sets the Width value.
		/// </summary>
		public  decimal Width
		{
			get { return width; }
			set { width = value; }
		}

		/// <summary>
		/// Gets or sets the Height value.
		/// </summary>
		public  decimal Height
		{
			get { return height; }
			set { height = value; }
		}

		/// <summary>
		/// Gets or sets the StockQuantity value.
		/// </summary>
		public  int StockQuantity
		{
			get { return stockQuantity; }
			set { stockQuantity = value; }
		}

		/// <summary>
		/// Gets or sets the MainImage value.
		/// </summary>
		public  string MainImage
		{
			get { return mainImage; }
			set { mainImage = value; }
		}

		/// <summary>
		/// Gets or sets the IsActive value.
		/// </summary>
		public  bool IsActive
		{
			get { return isActive; }
			set { isActive = value; }
		}

		/// <summary>
		/// Gets or sets the DateAdded value.
		/// </summary>
		public  DateTime DateAdded
		{
			get { return dateAdded; }
			set { dateAdded = value; }
		}

		/// <summary>
		/// Gets or sets the DateModified value.
		/// </summary>
		public  DateTime DateModified
		{
			get { return dateModified; }
			set { dateModified = value; }
		}

		#endregion
	}
}
