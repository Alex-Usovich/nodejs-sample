module.exports = {
  createUserConversationMessage: async function(
    conversationMessageRepository,
    payload
  ) {
    const { convo_id, requested, respond, frombot, message_uid }  = payload;

    try {
      return await conversationMessageRepository
        .createUserConversationMessage({
            convo_id, frombot, requested, respond, message_uid
        });
    } catch(error) {
      return false;
    }
  },

  getInitialHistory: async function (
    conversationMessageRepository,
    payload
  ){
    const { email, amount } = payload;
    const normalized = email.toLowerCase();

    try {
      const messages =  await conversationMessageRepository
        .getInitialHistory({
          normalized, amount
        });
      const count =  await conversationMessageRepository
        .getMessagesCount({
          normalized
        });

      return {
        db: {
            messages: messages,
            count: count
        }
      };
    } catch(error) {
      return false;
    }
  },

  getHistory: async function (
    conversationMessageRepository,
    payload
  ){
    const { email, message_uid, amountPerPage } = payload;
    const normalized = email.toLowerCase();

    try {
      const messages = await conversationMessageRepository.getHistory({
        normalized, message_uid, amountPerPage
      });
      const count =  await conversationMessageRepository
        .getMessagesCount({
          normalized
        });

      return {
        db: {
          messages: messages,
          count: count
        }
      };
    } catch(error) {
        return false;
    }
  },

  hasPostedMessagesToday: async function(
    conversationMessageRepository,
    payload
  ) {
    try {
      const { email } = payload.email.toLowerCase();

      return await conversationMessageRepository
        .amountOfMessagesToday({
          email
        });
    } catch (e) {
      return true;
    }
  },

  check24hActivity: async function(
    conversationMessageRepository,
    payload
  ) {
    const email = payload.email.toLowerCase();

    try {
      return await conversationMessageRepository
        .check24hActivity({
          email
        });
    } catch (e) {
        return true;
    }
  },

  check48hActivity: async function(
    conversationMessageRepository,
    payload
  ) {
    const email = payload.email.toLowerCase();

    try {
      return await conversationMessageRepository
        .check48hActivity({
          email
        });
    } catch (e) {
      return true;
    }
  },

  check24hN48hActivity: async function(
    conversationMessageRepository,
    payload
  ) {
    const email = payload.email.toLowerCase();

    try {
      const res24h =  await conversationMessageRepository
        .check24hActivity({
          email
        });
      const res48h =  await conversationMessageRepository
        .check48hActivity({
          email
        });

      return {
        res24h,
        res48h
      };
    } catch (e) {
      return true;
    }
  }
};
