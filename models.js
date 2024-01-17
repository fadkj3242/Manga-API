const axios = require('axios');
const cheerio = require('cheerio');
const urldata = require('url');

const url = 'https://ww7.mangakakalot.tv';

async function search(query, page) {
    if (!query) return { 'message': 'Missing Query' };
    if (!page) page = 1;
    try {
        const response = await axios.get(`${url}/search/${query}?page=${page}`);
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            const mangaList = [];
            $('.daily-update .panel_story_list .story_item').each((index, element) => {
                const mangaID = $(element).find('a').attr('href').replace('/manga/', '');
                const thumbnail = $(element).find('a img').attr('src');
                const title = $(element).find('a img').attr('alt');
                const author = $(element).find('.story_item_right span:eq(0)').text().replace('Author(s) : ', '').split('\n').map(author => author.trim()).filter(author => author !== '');
                const update = $(element).find('.story_item_right span:eq(1)').text().replace('Updated : ', '').trim();
                const view = $(element).find('.story_item_right span:eq(2)').text().replace('View : ', '').trim();

                const mangaInfo = {
                'id': mangaID,
                'img': thumbnail,
                'title': title,
                'author': author,
                'update': update,
                'view': view
                };
                mangaList.push(mangaInfo);
            });
            const currentPage = $('.panel_page_number .group_page .page_select').text();
            const totalPage = $('.panel_page_number .group_page .page_last').last().attr('href');
            const parsedUrl = urldata.parse(totalPage, true);
            const pageNumber = parsedUrl.query.page;
            mangaList.push({ 'page': currentPage, 'totalPage': pageNumber });
            return mangaList;
        }
    } catch (error) {
        console.error(`Caught an error: ${error.message}`);
    }
}


async function chapterInfo(query) {
    if (!query) return { 'message': 'Missing Query ID' };
    try {
        const response = await axios.get(`${url}/manga/${query}`);
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            const img = $('.manga-info-top .manga-info-pic img').attr('src');
            const title = $('.manga-info-top .manga-info-text li:eq(0) h1').text().trim();
            const alternative = $('.manga-info-top .manga-info-text li:eq(0) h2').text().split(';').map(alternative => alternative.trim());
            const authors = $('.manga-info-top .manga-info-text li:contains("Author(s)")').find('a').map((index, element) => $(element).text().trim()).get();
            const status = $('.manga-info-top .manga-info-text li:eq(2)').text().replace('Status : ', '').trim();
            const lastUpdate = $('.manga-info-top .manga-info-text li:eq(3)').text().replace('Last updated : ', '').trim();
            const view =  $('.manga-info-top .manga-info-text li:eq(5)').text().replace('View : ', '').trim();
            const genres = $('.manga-info-top .manga-info-text li:contains("Genres")').find('a').map((index, element) => $(element).text().trim()).get();
            const { averageRate, bestRate, votes } = {
                averageRate: $('.manga-info-top .manga-info-text li:eq(8) em[property="v:average"]').text().trim(),
                bestRate: $('.manga-info-top .manga-info-text li:eq(8) em[property="v:best"]').text().trim(),
                votes: $('.manga-info-top .manga-info-text li:eq(8) em[property="v:votes"]').text().trim()
            };
            const summary = $('#noidungm').contents().last().text().trim(); 
            const chapters = [];
            $('.chapter .manga-info-chapter .chapter-list .row').each((index, element) => {
                const chapterName = $(element).find('a').text().trim();
                const chapterID = $(element).find('a').attr('href').replace('/chapter/', '');
                const views = $(element).find('span:nth-child(2)').text().trim();
                const timeUploaded = $(element).find('span:nth-child(3)').text().trim();
                const chapterInfo = {
                    chapterName,
                    chapterID,
                    views,
                    timeUploaded
                };
                chapters.push(chapterInfo);
            });
            const results = {
                'img': `${url}${img}`,
                title,
                alternative,
                authors,
                status,
                lastUpdate,
                view,
                genres,
                'rate': `${averageRate}/${bestRate}`,
                votes,
                summary,
                chapters
            };
            return results;
        }
    } catch (error) {
        console.error(`Caught an error: ${error.message}`);
    }
}


async function fetchChapter(query) {
    if (!query) return { 'message': 'Missing Chapter ID' };
    try {
        const response = await axios.get(`${url}/chapter/${query}`);
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            const title = $('.info-top-chapter h2').text().trim().replace('\n', '').replace(/\s+/g, ' ');
            const images = []; 
            $('.vung-doc img[data-src]').each((index, element) => {
                const imgSrc = $(element).attr('data-src');
                images.push(imgSrc);
            });
            const chapter = {
                title,
                images
            }
            return chapter;
        }
    } catch (error) {
        console.error(`Caught an error: ${error.message}`);
    }
}

module.exports = {
    search,
    chapterInfo,
    fetchChapter
};