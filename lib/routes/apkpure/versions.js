const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { region, pkg } = ctx.params;
    const prefix = region === 'en' ? 'https://apkpure.com' : `https://apkpure.com/${region}`;
    let $ = await got.get(`${prefix}/search?q=${pkg}`).then((r) => cheerio.load(r.data));
    const apppage = $('.search-title:nth-child(1)>a').attr('href');
    const link = `https://apkpure.com${apppage}/versions`;

    $ = await got.get(link).then((r) => cheerio.load(r.data));
    const img = new URL($('.ver-top img').attr('src'));
    img.searchParams.delete('w'); // get full resolution icon
    ctx.state.data = {
        title: $('.ver-top-h1').text(),
        description: `<img referrerpolicy="no-referrer" src="${img.href}"> ` + $('.ver-top-title>h2').text(),
        link: decodeURI(link),
        item: $('.ver li')
            .toArray()
            .map((ver) => ({
                title: $(ver)
                    .find('.ver-item-n')
                    .text(),
                description: $(ver)
                    .find('a')
                    .attr('title'),
                link: `https://apkpure.com${decodeURI(
                    $(ver)
                        .find('a')
                        .attr('href')
                        .split('?from')[0]
                )}`,
                pubDate: new Date(
                    $(ver)
                        .find('.update-on')
                        .text()
                        .replace(/年|月/g, '-')
                        .replace('日', '')
                ).toUTCString(),
            })),
    };
};
