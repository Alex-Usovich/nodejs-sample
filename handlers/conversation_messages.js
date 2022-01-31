module.exports = {
  getConversationMessages: function(conversationMessageRepository) {
    return async function(req, res) {
      const { conversation_id } = req.body;

      const conversation_messages = await conversationMessageRepository
        .getConversationMessages(conversation_id);

      if (conversation_messages) {
        res.status(200).json({ conversation_messages });

        return;
      }

      res.sendStatus(404);
    };
  },

  getUserConversationMessages: function(conversationMessageRepository) {
    return async function(req, res) {
      const { email } = req.body;
      const normalizedEmail = email.toLowerCase();

      const conversations = await conversationMessageRepository
        .getUserConversationMessages(normalizedEmail);

      if (conversations) {
        res.status(200).json({ conversations });

        return;
      }

      res.sendStatus(404);
    };
  },

  createUserConversationMessage: function(conversationMessageRepository) {
    return async function(req, res) {
      const { convo_id, requested, respond }  = req.body;

      try {
        const created = await conversationMessageRepository
          .createUserConversationMessage({
            convo_id, requested, respond
          });

        if (created) {
            res.sendStatus(204);
        }
      } catch(error) {
        res.sendStatus(500);
      }
    };
  },
};
