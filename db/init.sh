node db/collection/initialize.js && \
sleep 3 && \
node db/index/users_by_username.js && \
sleep 3 && \
node db/index/users_by_email.js && \
sleep 3 && \
node db/index/leagues_by_name.js && \
sleep 3 && \
node db/index/drafts_by_user.js && \
sleep 3 && \
node db/add_user.js && \
sleep 3 && \
node db/add_league.js && \
sleep 3 && \
node db/add_draft.js;