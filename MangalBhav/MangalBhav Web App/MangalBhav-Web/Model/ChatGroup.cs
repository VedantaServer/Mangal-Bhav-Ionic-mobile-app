using System;
namespace FaceUPAI.Models
{
	public class ChatGroup
	{
		#region Fields

		private int chatGroupID;
		private string groupName;
		private int createdBy;
		private DateTime createdAt;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the ChatGroup class.
		/// </summary>
		public ChatGroup()
		{
		}

		/// <summary>
		/// Initializes a new instance of the ChatGroup class.
		/// </summary>
		public ChatGroup(string groupName, int createdBy, DateTime createdAt)
		{
			this.groupName = groupName;
			this.createdBy = createdBy;
			this.createdAt = createdAt;
		}

		/// <summary>
		/// Initializes a new instance of the ChatGroup class.
		/// </summary>
		public ChatGroup(int chatGroupID, string groupName, int createdBy, DateTime createdAt)
		{
			this.chatGroupID = chatGroupID;
			this.groupName = groupName;
			this.createdBy = createdBy;
			this.createdAt = createdAt;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the ChatGroupID value.
		/// </summary>
		public  int ChatGroupID
		{
			get { return chatGroupID; }
			set { chatGroupID = value; }
		}

		/// <summary>
		/// Gets or sets the GroupName value.
		/// </summary>
		public  string GroupName
		{
			get { return groupName; }
			set { groupName = value; }
		}

		/// <summary>
		/// Gets or sets the CreatedBy value.
		/// </summary>
		public  int CreatedBy
		{
			get { return createdBy; }
			set { createdBy = value; }
		}

		/// <summary>
		/// Gets or sets the CreatedAt value.
		/// </summary>
		public  DateTime CreatedAt
		{
			get { return createdAt; }
			set { createdAt = value; }
		}

		#endregion
	}
}
