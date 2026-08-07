using System;
namespace FaceUPAI.Models
{
	public class OrderFeedback
	{
		#region Fields

		private int orderFeedbackID;
		private int fK_OrderID;
		private string customerName;
		private int rating;
		private string reviewTitle;
		private string review;
		private string imageURL;
		private bool isApproved;
		private DateTime dateAdded;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the OrderFeedback class.
		/// </summary>
		public OrderFeedback()
		{
		}

		/// <summary>
		/// Initializes a new instance of the OrderFeedback class.
		/// </summary>
		public OrderFeedback(int fK_OrderID, string customerName, int rating, string reviewTitle, string review, string imageURL, bool isApproved, DateTime dateAdded)
		{
			this.fK_OrderID = fK_OrderID;
			this.customerName = customerName;
			this.rating = rating;
			this.reviewTitle = reviewTitle;
			this.review = review;
			this.imageURL = imageURL;
			this.isApproved = isApproved;
			this.dateAdded = dateAdded;
		}

		/// <summary>
		/// Initializes a new instance of the OrderFeedback class.
		/// </summary>
		public OrderFeedback(int orderFeedbackID, int fK_OrderID, string customerName, int rating, string reviewTitle, string review, string imageURL, bool isApproved, DateTime dateAdded)
		{
			this.orderFeedbackID = orderFeedbackID;
			this.fK_OrderID = fK_OrderID;
			this.customerName = customerName;
			this.rating = rating;
			this.reviewTitle = reviewTitle;
			this.review = review;
			this.imageURL = imageURL;
			this.isApproved = isApproved;
			this.dateAdded = dateAdded;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the OrderFeedbackID value.
		/// </summary>
		public  int OrderFeedbackID
		{
			get { return orderFeedbackID; }
			set { orderFeedbackID = value; }
		}

		/// <summary>
		/// Gets or sets the FK_OrderID value.
		/// </summary>
		public  int FK_OrderID
		{
			get { return fK_OrderID; }
			set { fK_OrderID = value; }
		}

		/// <summary>
		/// Gets or sets the CustomerName value.
		/// </summary>
		public  string CustomerName
		{
			get { return customerName; }
			set { customerName = value; }
		}

		/// <summary>
		/// Gets or sets the Rating value.
		/// </summary>
		public  int Rating
		{
			get { return rating; }
			set { rating = value; }
		}

		/// <summary>
		/// Gets or sets the ReviewTitle value.
		/// </summary>
		public  string ReviewTitle
		{
			get { return reviewTitle; }
			set { reviewTitle = value; }
		}

		/// <summary>
		/// Gets or sets the Review value.
		/// </summary>
		public  string Review
		{
			get { return review; }
			set { review = value; }
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
		/// Gets or sets the IsApproved value.
		/// </summary>
		public  bool IsApproved
		{
			get { return isApproved; }
			set { isApproved = value; }
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
