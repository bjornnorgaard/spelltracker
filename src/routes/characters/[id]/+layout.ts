export const ssr = false;

export function load({params}) {
    return {
        characterId: params.id,
    };
}
