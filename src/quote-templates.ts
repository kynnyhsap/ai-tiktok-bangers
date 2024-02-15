type QuoteTmplateArgs = {
  mid: string;
  banger: string;
  him: string;
};

export const QUOTE_TEMPLATES = {
  youSay({ mid, banger, him }: QuoteTmplateArgs) {
    return `You say "${mid}", but ${him} said "${banger}"`;
  },

  whenHeSays({ mid, banger, him }: QuoteTmplateArgs) {
    return `When he says "${mid}", but ${him} said "${banger}"`;
  },
};
