/* DOC: requirejs define
 * Note that this is an anonymous define. The module name for this panel is 
 * provided in require-config.js, which associates a string key with this module file.
 * The only dependency required to implement a panel is a promises library,
 * in this case Q (cit. here).
 * It is very commong to have jquery and kb.html also included, as they
 * assist greatly in building html and manipulating the DOM, and kb.runtime
 * since it is the primary interface to the user interface runtime.
 * In addition, any widgets will need to be included here as well.
 * (Well, some usage patterns may load widgets in a different way, but this
 *  sample panel represents a moderately straightforward implementation.)
 *  
 *  Formatting: I find that listing each module name on a separate line 
 *  enhances readability.
 * 
 */
define([
    'require',
    'bluebird',
    'kb_common/html',
    'kb_common/bootstrapUtils',
    './lib/utils'
], function (
    require,
    Promise, 
    html, 
    BS,
    Utils
) {
    /* DOC: strict mode
        * We always set strict mode with the following magic javascript
        * incantation.
        */
    'use strict';

    /*
    * DOC: html helper module
    * The html helper module is quite useful for building 
    * html in a functional style. It has a generic tag function
    * builder, as well as methods to build more complex html
    * structures.
    */
    var t = html.tag,
        h2 = t('h1'),
        p = t('p'),
        div = t('div'),
        table = t('table'),
        tbody = t('tbody'),
        tr = t('tr'),
        th = t('th'),
        td = t('td');

    function factory(config) {
        /* DOC: widget variables and factory pattern
            * In the factory pattery for object creation, we can just
            * declare variables within the factory function, and they 
            * are naturally available to all functions defined within.
            * 
            * In this case we need to store references to the original 
            * DOM node passed during attachment (mount), the DOM node
            * created by the Panel for its own use (container),
            * and an array of subwidgets (children).
            */
        var hostNode, container,
            runtime = config.runtime;

        function getStats() {
            var debug = window.require.s.contexts.DEFAULT_CONTEXT.debug();
            var stats = debug.stats;
            console.log('stats', stats);
            var modules = Object.keys(stats).map(function (moduleId) {
                var mod =  stats[moduleId];
                return {
                    id: moduleId,
                    used: mod.used,
                    created: mod.created,
                    lastUsed: mod.lastUsed
                };
            })
                .sort(function (a, b) {
                    return b.used - a.used;
                });
            console.log('modules', modules);
            return table({
                class: 'table'
            }, [
                tbody([
                    tr([
                        th('Module'),
                        th('Used'),
                        th('Created'),
                        th('Last used')
                    ]),
                    modules.map(function (module) {
                        return tr([
                            td(String(module.id)),
                            td(String(module.used)),
                            td(module.created.toLocaleString()),
                            td(module.lasteUsed ? module.lastUsed.toLocaleString() : 'n/a')
                        ]);
                    })
                ])
            ]);
        }

        function layout() {
            /* DOC: return some structure
                * The render function returns enough structure to represent
                * what needs to be rendered. This is not hard-coded at all, 
                * and is just a convention within this panel. It has turned
                * out, however, to be a useful pattern.
                */
            // var stats = getStats();
            return div({
                class: 'plugin_ui-diagnostics container-fluid'
            }, [
                div({
                    class: 'row'
                }, [
                    div({class: 'col-sm-6'}, [
                        h2('UI Diagnostics'),
                       
                        getStats()
                    ]),
                    div({class: 'col-sm-6'}, [
                        BS.buildPanel({
                            title: 'Sample Panel',
                            body: div([
                                p('This is a simple panel in a simple widget'),
                                p([
                                    'It does\'t do much other than demonstrate the relatively easy creation of ',
                                    'a bootstrap panel within a ui panel.'
                                ]),
                                p(Utils.something())
                            ])
                        })
                    ])
                ])
            ]);
        }

        /* DOC: init event
        * Since a panel implements the widget interface, it starts 
        * with an init event handler. The init event gives the panel
        * a chance to set up whetever it needs, and to fail early if
        * the proper conditions are not met.
        * In this case, we really just need to initialize the sub-widgets.
        * 
        */
        function init(config) {
            return null;
        }

        /* DOC: attach event
        * This attach() function implements the attach lifecycle event
        * in the Panel Widget lifecycle interface.
        * It is invoked at  point at which the parent environment has
        * obtained a concerete DOM node at which to attach this Panel,
        * and is ready to allow the Panel to attach itself to it.
        * The Panel should not do anything with the provided node
        * other than attach its own container node. This is because 
        * in some environments, it may be that the provided node is
        * long lived. A panel should not, for example, attach DOM listeners
        * to it.
        * 
        */
        function attach(node) {
            /* DOC: creating our attachment point
            *  Here we save the provided node in the mount variable,
            *  and attach our own container node to it. This pattern
            *  allows us to attach event listeners as we wish to 
            *  our own container, so that we have more control
            *  over it. E.g. we can destroy and recreate it if we
            *  want another set of event listeners and don't want
            *  to bother with managing them all individually.
            */
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));

            /* DOC: implement widget manager attach lifecycle event
                * Okay, here we run all of the widgets through the 
                * 
                */
            return null;
        }
        function start(params) {
            /* DOC: dom access
            * In this case we are keeping things simple by using 
            * the plain DOM API. We could also use jquery 
            * here if we wish to.
            */
            container.innerHTML = layout();

            /* DOC: runtime interface
            * Since a panel title is also, logically, the title of
            * the "page" we use the runtimes event bus to emit the
            * 'title' event to the application. The application 
            * takes care of modifying the window panel to accomodate
            * it.
            */
            runtime.send('ui', 'setTitle', 'UI Diagnostics');
        }
        function run(params) {
            
        }
        function stop() {
            
        }
        function detach() {
            if (hostNode && container) {
                hostNode.removeChild(container);
            }
        }
        function destroy() {
            
        }

        /* Returning the widget
        The widget is returned as a simple JS object. In this case we have also hardened the object
        by usinng Object.freeze, which ensures that properties may not be added or modified.
        */
        return Object.freeze({
            init: init,
            attach: attach,
            start: start,
            run: run,
            stop: stop,
            detach: detach,
            destroy: destroy
        });
    }

    return {
        make: factory
    };
});