using System;
namespace FaceUPAI.Models
{
	public class FeedLike
	{
		#region Fields

		private int feedLikeID;
		private int feedID;
		private int userID;
		private DateTime dateAdded;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the FeedLike class.
		/// </summary>
		public FeedLike()
		{
		}

		/// <summary>
		/// Initializes a new instance of the FeedLike class.
		/// </summary>
		public FeedLike(int feedID, int userID, DateTime dateAdded)
		{
			this.feedID = feedID;
			this.userID = userID;
			this.dateAdded = dateAdded;
		}

		/// <summary>
		/// Initializes a new instance of the FeedLike class.
		/// </summary>
		public FeedLike(int feedLikeID, int feedID, int userID, DateTime dateAdded)
		{
			this.feedLikeID = feedLikeID;
			this.feedID = feedID;
			this.userID = userID;
			this.dateAdded = dateAdded;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the FeedLikeID value.
		/// </summary>
		public  int FeedLikeID
		{
			get { return feedLikeID; }
			set { feedLikeID = value; }
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
