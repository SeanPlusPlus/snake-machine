node db/collection/delete.js && \
echo "Collections deleted, sleeping just over 1 min"
sleep 65;
node db/collection/initialize.js && \
echo "Collections initialized"
node db/index/users_by_username.js && \
node db/index/users_by_email.js && \
node db/index/leagues_by_name.js && \
node db/index/drafts_by_user.js;
node db/add_user.js;
sleep 5;
node db/add_league.js;
sleep 5;
node db/add_draft.js;