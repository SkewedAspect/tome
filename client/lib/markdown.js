//----------------------------------------------------------------------------------------------------------------------
// MarkdownService
//
// @module
//----------------------------------------------------------------------------------------------------------------------

import hljs from 'highlightjs';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import taskLists from 'markdown-it-task-lists';
import toc from 'markdown-it-table-of-contents';

//----------------------------------------------------------------------------------------------------------------------

class MarkdownService
{
    constructor()
    {
        this.mdRenderer = new MarkdownIt({
                html: true,
                linkify: true,
                typographer: true,
                highlight(str, lang)
                {
                    if (lang && hljs.getLanguage(lang))
                    {
                        try {
                            return `<pre class="hljs card bg-light"><code>${ hljs.highlight(lang, str, true).value }</code></pre>`;
                        } catch (_) {}
                    } // end if

                    return `<pre class="hljs card bg-light"><code>${ md.utils.escapeHtml(str) }</code></pre>`;
                }
            });

        // Default plugins
        this.mdRenderer
            .use(anchor, { permalink: true, permalinkClass: 'tome-anchor-link', permalinkSymbol: '#' })
            .use(taskLists)
            .use(toc, { includeLevel: [1, 2, 3, 4], containerClass: 'card bg-light tome-toc' });

        // Modify the rendering rules
        this.$modifyRules();
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Internal
    //------------------------------------------------------------------------------------------------------------------

    $modifyRules()
    {
        //TODO: Make the table classes configurable.
        this.mdRenderer.renderer.rules.table_open = function(tokens, idx)
        {
            return '<table class="table table-bordered table-striped">';
        };
    } // end $modifyRules

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    use(plugin)
    {
        return this.mdRenderer.use(plugin);
    } // end use

    enable(rules, ignoreInvalid)
    {
        this.mdRenderer.enable(rules, ignoreInvalid);
    } // end enable

    disable(rules, ignoreInvalid)
    {
        this.mdRenderer.disable(rules, ignoreInvalid);
    } // end enable

    render(text)
    {
        return this.mdRenderer.render(text);
    } // end render

    renderInline(text)
    {
        return this.mdRenderer.render(text);
    } // end renderInline
} // end MarkdownService

//----------------------------------------------------------------------------------------------------------------------

export default new MarkdownService();

//----------------------------------------------------------------------------------------------------------------------
