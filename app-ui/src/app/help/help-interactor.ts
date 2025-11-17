import { BaseInteractor } from '@/common/base-interactor.ts';
import { UnsupportedOperationError } from '@/common/exceptions.ts';
import type { HelpInputProtocol, HelpOutputProtocol } from '@/app/help/help-protocol.ts';
import { marked } from 'marked';

class HelpInteractor
    extends BaseInteractor<HelpOutputProtocol, never>
    implements HelpInputProtocol
{
    constructor() {
        super();
    }

    protected getComponentName(): string {
        throw new UnsupportedOperationError('Method not implemented.');
    }

    fetchHelpContent(): void {
        fetch('./help.md', {
            cache: 'force-cache',
            signal: this.abortSignal,
        })
            .then((res) => res.text())
            .then((text) => this.outputProtocol.helpContentFetched(<string>marked.parse(text)))
            .catch(this.outputProtocol.helpContentError);
    }
}

const useHelpInteractor: () => HelpInputProtocol & BaseInteractor<HelpOutputProtocol, never> = () =>
    new HelpInteractor();

export { useHelpInteractor };
