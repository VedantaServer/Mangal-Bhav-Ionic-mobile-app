using System;
namespace FaceUPAI.Models
{
	public class Feedback
	{
		#region Fields

		private int feedbackID;
		private int tenantID;
		private int bookingID;
		private int ratings;
		private string description;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the Feedback class.
		/// </summary>
		public Feedback()
		{
		}

		/// <summary>
		/// Initializes a new instance of the Feedback class.
		/// </summary>
		public Feedback(int feedbackID, int tenantID, int bookingID, int ratings, string description, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.feedbackID = feedbackID;
			this.tenantID = tenantID;
			this.bookingID = bookingID;
			this.ratings = ratings;
			this.description = description;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the FeedbackID value.
		/// </summary>
		public  int FeedbackID
		{
			get { return feedbackID; }
			set { feedbackID = value; }
		}

		/// <summary>
		/// Gets or sets the TenantID value.
		/// </summary>
		public  int TenantID
		{
			get { return tenantID; }
			set { tenantID = value; }
		}

		/// <summary>
		/// Gets or sets the BookingID value.
		/// </summary>
		public  int BookingID
		{
			get { return bookingID; }
			set { bookingID = value; }
		}

		/// <summary>
		/// Gets or sets the Ratings value.
		/// </summary>
		public  int Ratings
		{
			get { return ratings; }
			set { ratings = value; }
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

		/// <summary>
		/// Gets or sets the UpdatedByUser value.
		/// </summary>
		public  string UpdatedByUser
		{
			get { return updatedByUser; }
			set { updatedByUser = value; }
		}

		#endregion
	}
}
