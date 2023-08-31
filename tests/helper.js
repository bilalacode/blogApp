const User = require("../models/user");
const Blog = require("../models/blog");
const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

const emptyDatabase = async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
};

const initialBlogs = [
  {
    title: "The Importance of User Experience in Web Design",
    content:
      "User Experience (UX) is a crucial aspect of web design that often goes overlooked. A well-designed website is not just about aesthetics; it's about how a user interacts with it. Good UX ensures that users can easily navigate your website, find the information they're looking for, and achieve their desired actions without any hiccups. This not only enhances user satisfaction but also increases the chances of them returning to your site. With the increasing competition in the online space, businesses can't afford to ignore UX. Investing in good UX design can lead to higher conversion rates, increased customer loyalty, and a stronger brand reputation. In today's digital age, where users have a plethora of options at their fingertips, a bad UX can drive them away. It's essential for businesses to understand their users, their needs, and design their websites accordingly. A user-centric approach to web design can set a business apart from its competitors and ensure long-term success. Furthermore, as technology continues to evolve, so do the expectations of users. They demand faster load times, intuitive navigation, and seamless interactions. This has pushed designers and developers to adopt new methodologies and tools to meet these demands. Tools like heatmaps and user journey maps have become essential in understanding how users interact with a website. A/B testing allows designers to test different design elements and see which one resonates more with the audience. All these tools and methodologies aim to enhance the overall user experience, ensuring that users not only visit a website but also engage with it. In conclusion, UX is not just a buzzword; it's a critical component of web design that directly impacts a business's bottom line. As the digital landscape continues to evolve, businesses that prioritize UX will stand out and achieve lasting success.",
  },
  {
    title: "The Rise of Progressive Web Apps",
    content:
      "Progressive Web Apps (PWAs) are changing the way we think about web applications. They bridge the gap between web and mobile apps by offering offline capabilities, push notifications, and fast load times. PWAs are built using standard web technologies, but they behave more like native apps. One of the main advantages of PWAs is that they are platform-independent. This means businesses can build a single PWA that works across all devices, eliminating the need for separate iOS and Android apps. As internet connectivity continues to improve globally, PWAs are set to become the new standard for web application development. The ability of PWAs to work offline and provide a native app-like experience has made them a favorite among businesses. They offer the best of both worlds - the flexibility of web apps and the functionality of native apps. As more businesses recognize the benefits of PWAs, we can expect a surge in their adoption in the coming years. Moreover, PWAs have the potential to revolutionize industries that rely heavily on mobile users. For instance, e-commerce businesses can leverage PWAs to provide a seamless shopping experience, even in areas with poor internet connectivity. News websites can deliver content to users on the go, ensuring they stay updated with the latest happenings. The potential applications of PWAs are vast, and as the technology matures, we can expect even more innovative use cases. In conclusion, PWAs represent the next big thing in web application development. They combine the best of web and mobile apps, offering users a seamless, fast, and reliable experience. As businesses continue to recognize the benefits of PWAs, we can expect a significant shift towards this technology in the coming years.",
  },
];

const blogsInDB = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const nonExistingId = async () => {
  const blog = new Blog({
    ...initialBlogs[0],
    user: new mongoose.Types.ObjectId(),
    metaDescription: "Placeholder meta description",
    author: "Placeholder author",
  });
  await blog.save();
  const id = blog._id;

  await Blog.findByIdAndDelete(id);

  return id.toString();
};

module.exports = { emptyDatabase, initialBlogs, blogsInDB, nonExistingId };
