using System;
namespace FaceUPAI.Models
{
	public class FeedComment
	{
		#region Fields

		private int feedCommentID;
		private int feedID;
		private int userID;
		private string comment;
		private bool isDeleted;
		private DateTime dateAdded;
		private DateTime dateModified;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the FeedComment class.
		/// </summary>
		public FeedComment()
		{
		}

		/// <summary>
		/// Initializes a new instance of the FeedComment class.
		/// </summary>
		public FeedComment(int feedID, int userID, string comment, bool isDeleted, DateTime dateAdded, DateTime dateModified)
		{
			this.feedID = feedID;
			this.userID = userID;
			this.comment = comment;
			this.isDeleted = isDeleted;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
		}

		/// <summary>
		/// Initializes a new instance of the FeedComment class.
		/// </summary>
		public FeedComment(int feedCommentID, int feedID, int userID, string comment, bool isDeleted, DateTime dateAdded, DateTime dateModified)
		{
			this.feedCommentID = feedCommentID;
			this.feedID = feedID;
			this.userID = userID;
			this.comment = comment;
			this.isDeleted = isDeleted;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the FeedCommentID value.
		/// </summary>
		public  int FeedCommentID
		{
			get { return feedCommentID; }
			set { feedCommentID = value; }
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
		/// Gets or sets the Comment value.
		/// </summary>
		public  string Comment
		{
			get { return comment; }
			set { comment = value; }
		}

		/// <summary>
		/// Gets or sets the IsDeleted value.
		/// </summary>
		public  bool IsDeleted
		{
			get { return isDeleted; }
			set { isDeleted = value; }
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
