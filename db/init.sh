node db/collection/initialize.js && \
node db/index/users_by_username.js && \
node db/index/users_by_email.js && \
node db/index/leagues_by_name.js && \
node db/index/drafts_by_user.js;
node db/add_user.js;
sleep 5;
node db/add_league.js;
sleep 5;
node db/add_draft.js;