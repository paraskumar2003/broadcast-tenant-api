"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TemplateBuilderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateBuilderService = void 0;
const common_1 = require("@nestjs/common");
let TemplateBuilderService = TemplateBuilderService_1 = class TemplateBuilderService {
    logger = new common_1.Logger(TemplateBuilderService_1.name);
    buildComponents(templateComponents, params) {
        const components = [];
        for (const element of templateComponents) {
            switch (element.type) {
                case 'HEADER':
                    this.buildHeader(element, params, components);
                    break;
                case 'BODY':
                    this.buildBody(params, components);
                    break;
                case 'CAROUSEL':
                    this.buildCarousel(element, components);
                    break;
                case 'BUTTONS':
                    this.buildButtons(element, params, components);
                    break;
            }
        }
        return components;
    }
    buildHeader(element, params, components) {
        let headerParameter;
        switch (element.format) {
            case 'VIDEO':
                headerParameter = {
                    type: 'video',
                    video: { link: params.image },
                };
                break;
            case 'DOCUMENT':
                headerParameter = {
                    type: 'document',
                    document: { link: params.image, filename: 'Document' },
                };
                break;
            case 'IMAGE':
            default:
                headerParameter = {
                    type: 'image',
                    image: { link: params.image },
                };
                break;
        }
        components.push({
            type: 'header',
            parameters: [headerParameter],
        });
    }
    buildBody(params, components) {
        const bodyParameters = [];
        Object.keys(params)
            .filter((key) => Number.isInteger(parseInt(key)))
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach((key) => {
            bodyParameters.push({
                type: 'text',
                text: String(params[key]),
            });
        });
        components.push({
            type: 'body',
            parameters: bodyParameters,
        });
    }
    buildCarousel(element, components) {
        const cards = element.cards.map((_, index) => ({
            card_index: index,
            components: [
                {
                    type: 'header',
                    parameters: [
                        {
                            type: 'image',
                            image: {
                                link: `https://almondvirtex.s3.ap-south-1.amazonaws.com/communication/carousel/${index + 1}.png`,
                            },
                        },
                    ],
                },
            ],
        }));
        components.push({
            type: 'carousel',
            cards,
        });
    }
    buildButtons(element, params, components) {
        if (!element.buttons)
            return;
        element.buttons.forEach((button, index) => {
            if (button.type === 'URL') {
                const buttonParam = params[`button_${index + 1}`];
                if (buttonParam) {
                    components.push({
                        type: 'button',
                        sub_type: 'url',
                        index: 0,
                        parameters: [{ type: 'text', text: buttonParam }],
                    });
                }
                else if (button.parameters && button.parameters.length > 0) {
                    components.push({
                        type: 'button',
                        sub_type: 'url',
                        index: index,
                        parameters: [
                            {
                                type: button.parameters[0]?.type || 'text',
                                text: button.parameters[0]?.text || '/',
                            },
                        ],
                    });
                }
            }
            else if (button.type === 'FLOW') {
                components.push({
                    type: 'button',
                    sub_type: 'flow',
                    index: '0',
                });
            }
        });
    }
};
exports.TemplateBuilderService = TemplateBuilderService;
exports.TemplateBuilderService = TemplateBuilderService = TemplateBuilderService_1 = __decorate([
    (0, common_1.Injectable)()
], TemplateBuilderService);
//# sourceMappingURL=template-builder.service.js.map