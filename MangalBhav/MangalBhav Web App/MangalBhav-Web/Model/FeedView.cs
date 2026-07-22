using System;
namespace FaceUPAI.Models
{
	public class FeedView
	{
		#region Fields

		private int feedViewID;
		private int feedID;
		private int userID;
		private DateTime viewedOn;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the FeedView class.
		/// </summary>
		public FeedView()
		{
		}

		/// <summary>
		/// Initializes a new instance of the FeedView class.
		/// </summary>
		public FeedView(int feedID, int userID, DateTime viewedOn)
		{
			this.feedID = feedID;
			this.userID = userID;
			this.viewedOn = viewedOn;
		}

		/// <summary>
		/// Initializes a new instance of the FeedView class.
		/// </summary>
		public FeedView(int feedViewID, int feedID, int userID, DateTime viewedOn)
		{
			this.feedViewID = feedViewID;
			this.feedID = feedID;
			this.userID = userID;
			this.viewedOn = viewedOn;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the FeedViewID value.
		/// </summary>
		public  int FeedViewID
		{
			get { return feedViewID; }
			set { feedViewID = value; }
		}

		/// <summary>
		/// Gets or sets the FeedID value.
		/// </summary>
		public  int FeedID
		{
			get { return feedID; }
			set { feedID = value; }
		}

		/// <summary>
		/// Gets or sets the UserID value.
		/// </summary>
		public  int UserID
		{
			get { return userID; }
			set { userID = value; }
		}

		/// <summary>
		/// Gets or sets the ViewedOn value.
		/// </summary>
		public  DateTime ViewedOn
		{
			get { return viewedOn; }
			set { viewedOn = value; }
		}

		#endregion
	}
}
