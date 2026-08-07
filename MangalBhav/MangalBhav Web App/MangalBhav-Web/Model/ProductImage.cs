using System;
namespace FaceUPAI.Models
{
	public class ProductImage
	{
		#region Fields

		private int productImageID;
		private int fK_ProductID;
		private string imageURL;
		private int displayOrder;
		private DateTime dateAdded;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the ProductImage class.
		/// </summary>
		public ProductImage()
		{
		}

		/// <summary>
		/// Initializes a new instance of the ProductImage class.
		/// </summary>
		public ProductImage(int fK_ProductID, string imageURL, int displayOrder, DateTime dateAdded)
		{
			this.fK_ProductID = fK_ProductID;
			this.imageURL = imageURL;
			this.displayOrder = displayOrder;
			this.dateAdded = dateAdded;
		}

		/// <summary>
		/// Initializes a new instance of the ProductImage class.
		/// </summary>
		public ProductImage(int productImageID, int fK_ProductID, string imageURL, int displayOrder, DateTime dateAdded)
		{
			this.productImageID = productImageID;
			this.fK_ProductID = fK_ProductID;
			this.imageURL = imageURL;
			this.displayOrder = displayOrder;
			this.dateAdded = dateAdded;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the ProductImageID value.
		/// </summary>
		public  int ProductImageID
		{
			get { return productImageID; }
			set { productImageID = value; }
		}

		/// <summary>
		/// Gets or sets the FK_ProductID value.
		/// </summary>
		public  int FK_ProductID
		{
			get { return fK_ProductID; }
			set { fK_ProductID = value; }
		}

		/// <summary>
		/// Gets or sets the ImageURL value.
		/// </summary>
		public  string ImageURL
		{
			get { return imageURL; }
			set { imageURL = value; }
		}

		/// <summary>
		/// Gets or sets the DisplayOrder value.
		/// </summary>
		public  int DisplayOrder
		{
			get { return displayOrder; }
			set { displayOrder = value; }
		}

		/// <summary>
		/// Gets or sets the DateAdded value.
		/// </summary>
		public  DateTime DateAdded
		{
			get { return dateAdded; }
			set { dateAdded = value; }
		}

		#endregion
	}
}
