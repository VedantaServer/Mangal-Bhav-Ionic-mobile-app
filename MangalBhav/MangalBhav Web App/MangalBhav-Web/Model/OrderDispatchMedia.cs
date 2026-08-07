using System;
namespace FaceUPAI.Models
{
	public class OrderDispatchMedia
	{
		#region Fields

		private int orderDispatchMediaID;
		private int fK_OrderDispatchID;
		private string mediaURL;
		private string mediaType;
		private int displayOrder;
		private string caption;
		private DateTime dateAdded;
		private int updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the OrderDispatchMedia class.
		/// </summary>
		public OrderDispatchMedia()
		{
		}

		/// <summary>
		/// Initializes a new instance of the OrderDispatchMedia class.
		/// </summary>
		public OrderDispatchMedia(int fK_OrderDispatchID, string mediaURL, string mediaType, int displayOrder, string caption, DateTime dateAdded, int updatedByUser)
		{
			this.fK_OrderDispatchID = fK_OrderDispatchID;
			this.mediaURL = mediaURL;
			this.mediaType = mediaType;
			this.displayOrder = displayOrder;
			this.caption = caption;
			this.dateAdded = dateAdded;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the OrderDispatchMedia class.
		/// </summary>
		public OrderDispatchMedia(int orderDispatchMediaID, int fK_OrderDispatchID, string mediaURL, string mediaType, int displayOrder, string caption, DateTime dateAdded, int updatedByUser)
		{
			this.orderDispatchMediaID = orderDispatchMediaID;
			this.fK_OrderDispatchID = fK_OrderDispatchID;
			this.mediaURL = mediaURL;
			this.mediaType = mediaType;
			this.displayOrder = displayOrder;
			this.caption = caption;
			this.dateAdded = dateAdded;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the OrderDispatchMediaID value.
		/// </summary>
		public  int OrderDispatchMediaID
		{
			get { return orderDispatchMediaID; }
			set { orderDispatchMediaID = value; }
		}

		/// <summary>
		/// Gets or sets the FK_OrderDispatchID value.
		/// </summary>
		public  int FK_OrderDispatchID
		{
			get { return fK_OrderDispatchID; }
			set { fK_OrderDispatchID = value; }
		}

		/// <summary>
		/// Gets or sets the MediaURL value.
		/// </summary>
		public  string MediaURL
		{
			get { return mediaURL; }
			set { mediaURL = value; }
		}

		/// <summary>
		/// Gets or sets the MediaType value.
		/// </summary>
		public  string MediaType
		{
			get { return mediaType; }
			set { mediaType = value; }
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
		/// Gets or sets the Caption value.
		/// </summary>
		public  string Caption
		{
			get { return caption; }
			set { caption = value; }
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
		/// Gets or sets the UpdatedByUser value.
		/// </summary>
		public  int UpdatedByUser
		{
			get { return updatedByUser; }
			set { updatedByUser = value; }
		}

		#endregion
	}
}
