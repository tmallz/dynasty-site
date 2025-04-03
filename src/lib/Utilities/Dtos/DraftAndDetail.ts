import type { Draft } from '$lib/api/dtos/DraftDtos/Draft';
import type { DraftDetail } from '$lib/api/dtos/DraftDtos/DraftDetail';

export interface DraftAndDetail {
	draft: Draft;
	detail: DraftDetail;
}
