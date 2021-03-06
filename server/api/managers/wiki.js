//----------------------------------------------------------------------------------------------------------------------
// WikiManager
//----------------------------------------------------------------------------------------------------------------------

// Rules Engines
const commentRE = require('../rules-engines/comments');
const wikiRE = require('../rules-engines/wiki');

// Resource Access
const commentRA = require('../resource-access/comments');
const wikiRA = require('../resource-access/wiki');

//----------------------------------------------------------------------------------------------------------------------

/* eslint-disable camelcase */

class WikiManager
{
    //------------------------------------------------------------------------------------------------------------------
    // Pages
    //------------------------------------------------------------------------------------------------------------------

    createPage(page)
    {
        return wikiRE.validatePage(page)
            .then(() => wikiRA.createPage(page))
            .then(() => wikiRA.getPage(page.path));
    } // end createPage

    getPage(path)
    {
        return wikiRE.validatePath(path)
            .then(() => wikiRA.getPage(path));
    } // end getPage

    getHistory(path)
    {
        return wikiRE.validatePath(path)
            .then(() => wikiRA.getPageHistory(path));
    } // end getHistory

    getRecentPageRevisions(max = 25)
    {
        return wikiRA.getRecentPageRevisions(max);
    } // end getRecentPageRevisions

    getPermission(path, action)
    {
        return wikiRE.validatePath(path)
            .then(() => wikiRA.getPermission(path, action));
    } // end getPermission

    editPage(page)
    {
        return wikiRE.validatePage(page)
            .then(() => wikiRA.updatePage(page))
            .then(() => wikiRA.getPage(page.path));
    } // end editPage

    movePage(oldPath, newPath)
    {
        return wikiRE.validateMovePage(oldPath, newPath)
            .then(() => wikiRA.movePage(oldPath, newPath))
            .then(() => wikiRA.getPage(newPath));
    } // end movePage

    searchPages(term)
    {
        return wikiRE.validateSearch(term)
            .then(() => wikiRA.searchPages(term));
    } // end searchPages

    deletePage(path)
    {
        return wikiRE.validatePath(path)
            .then(() => wikiRA.deletePage(path));
    } // end movePage

    fullDeletePage(path)
    {
        return wikiRE.validatePath(path)
            .then(() => wikiRA.fullDeletePage(path));
    } // end fullDeletePage

    //------------------------------------------------------------------------------------------------------------------
    // Comments
    //------------------------------------------------------------------------------------------------------------------

    getComment(comment_id)
    {
        return commentRE.validateCommentID(comment_id)
            .then(() => commentRA.getComment(comment_id));
    } // end getComment

    getComments(path)
    {
        return wikiRE.validatePath(path)
            .then(() => commentRA.getComments(path));
    } // end getComments

    getRecentComments(max = 25)
    {
        return commentRA.getRecentComments(max);
    } // end getRecentComments

    addComment(comment)
    {
        return commentRE.validateComment(comment)
            .then(() => commentRA.addComment(comment))
            .then(({ id }) => commentRA.getComment(id));
    } // end addComment

    editComment(comment)
    {
        return commentRE.validateComment(comment)
            .then(() => commentRA.updateComment(comment))
            .then(() => commentRA.getComment(comment.comment_id));
    } // end editComment

    deleteComment(pageID, commentID)
    {
        return wikiRE.validatePageID(pageID)
            .then(() => commentRE.validateCommentID(commentID))
            .then(() => commentRA.deleteComment(pageID, commentID));
    } // end deleteCommentID
} // end WikiManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new WikiManager();

//----------------------------------------------------------------------------------------------------------------------
